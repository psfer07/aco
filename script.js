window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const windowsCheckbox = document.getElementById("windows");
    const show_gridCheckbox = document.getElementById("show_grid");
    const show_obstaclesCheckbox = document.getElementById("show_obstacles");
    const antsRange = document.getElementById("ants");
    const ants_value = document.getElementById("ants_value");
    const startButton = document.getElementById("start");
    const gridWidth = 100;
    const gridHeight = 110;
    const cellSize = 7;
    const alpha = 2;
    const beta = 5;
    const rho = 0.1;
    let HasSimStarted = false;
    let windowColor = "cyan";
    let startingPoint, exits = null
    let grid = createGrid()

    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    class Ant {
        constructor(startX, startY, alpha, beta, obstacles, exits) {
            this.currentX = startX; // Actual coord (x)
            this.currentY = startY; // Actual coord (y)
            this.visited = [{ x: startX, y: startY }]; // Cells where the ant passes
            this.alpha = alpha; // Influence of pheromone
            this.beta = beta; // Influence of heuristic
            this.obstacles = obstacles; // Cells marked as obstacles
            this.exits = exits; // Cells marked as exits
        }
        movement(grid) {
            const directions = [
                { dx: 0, dy: -1 },  // Up
                { dx: 0, dy: 1 },   // Down
                { dx: -1, dy: 0 },  // Left
                { dx: 1, dy: 0 }    // Right
            ];
            // Filter all the available directions from the new position
            directions.filter(direction => {
                let newX = this.currentX + direction.dx; // Moves ant
                let newY = this.currentY + direction.dy; // Moves ant
                return newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length && // If the moved cell is inside the grid
                    !this.visited.some(visited => visited.x === newX && visited.y === newY) && // If the new position doesn't match a visited cell
                    !this.obstacles.some(obstacle => obstacle.x === newX && obstacle.y === newY); // If the new position is not marked as an exit
            });
            do {
                let move = directions[Math.floor(Math.random() * directions.length)];
                this.currentX += move.dx;
                this.currentY += move.dy;
                this.visited.push({ x: this.currentX, y: this.currentY });
            } while (this.visited.length < 10000 && !this.exits.some(exit => exit.x === this.currentX && exit.y === this.currentY))
        }
    }

    function createGrid() {
        const grid = [];
        const properties = { // Each cell will have these properties by default
            color: "#ccc",
            pheromone: 1.0
        };
        for (let x = 0; x < gridWidth; x++) {
            const cols = [];
            for (let y = 0; y < gridHeight; y++) {
                cols.push({ ...properties });
            }
            grid.push(cols);
        }
        return grid;
    }
    // This is not the grid created by the createGrid function but the separator lines between cells
    function drawGrid() {
        paint.strokeStyle = "#aaa";
        paint.lineWidth = 0.3;
        paint.beginPath();
        for (let i = 0; i <= Math.max(canvas.width, canvas.height); i += cellSize) {
            paint.moveTo(0, i);
            paint.lineTo(canvas.width, i);
            paint.moveTo(i, 0);
            paint.lineTo(i, canvas.height);
        }
        paint.stroke();
    }
    function drawObstacles() {
        // Pillars
        for (const pillar of obstacles.pillars.positions) {
            setColor([pillar.x, pillar.x + obstacles.pillars.width - 1], [pillar.y, pillar.y + obstacles.pillars.height - 1], obstacles.pillars.color);
        }
        // Teacher's table
        const Ttable = obstacles.teacher_table
        setColor([Ttable.x, Ttable.x + Ttable.width - 1], [Ttable.y, Ttable.y + Ttable.height - 1], Ttable.color);
        // Tables
        const table = obstacles.tables;
        for (let sector = 0; sector < table.sectors.count; sector++) {
            const sectorX = 3.3 * table.margins.marginsector * sector + table.margins.marginsector * 0.5;
            for (let col = 0; col < table.sectors.cols; col++) {
                const tableX = sectorX + col * (table.width + table.margins.marginX);
                for (let row = 0; row < table.sectors.rows; row++) {
                    const tableY = 25 + row * (table.margins.marginY + table.height);
                    setColor([tableX, tableX + table.width], [tableY, tableY + table.height], table.color);
                }
            }
        }
    }
    function drawRoom() {
        // Floor
        setColor([2, gridWidth - 3], [2, gridHeight - 3], "#ccc");
        // Walls
        for (const wall of walls.horz.positions) {
            setColor([wall.x, wall.x + walls.horz.width - 1], [wall.y, wall.y + walls.horz.height - 1], walls.color);
        }
        for (const wall of walls.vert.positions) {
            setColor([wall.x, wall.x + walls.vert.width - 1], [wall.y, wall.y + walls.vert.height - 1], walls.color);
        }
        // Windows
        for (const window of windows.positions) {
            setColor([window.x, window.x + windows.width - 1], [window.y, window.y + windows.height - 1], windows.color);
        }
        // Door
        setColor([door.x, door.x + door.width - 1], [door.y, door.y + door.height - 1], door.color);
    }
    function setColor(x, y, color) {
        const X = Array.isArray(x) ? x[0] : x;
        const endX = Array.isArray(x) ? x[1] : x;
        const Y = Array.isArray(y) ? y[0] : y;
        const endY = Array.isArray(y) ? y[1] : y;

        for (let i = X; i <= endX; i++) {
            for (let j = Y; j <= endY; j++) {
                grid[i][j].color = color
            }
        }
    }
    function drawElements(x, y, antX, antY) {
        drawRoom();
        setColor(x, y, "red");
        setColor(antX, antY, "green");
        show_obstaclesCheckbox.checked ? drawObstacles() : false
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
        show_gridCheckbox.checked ? drawGrid() : false
    }
    function getCoords(color) {
        let cells = [];
        for (let x = 0; x < gridWidth; x++) {
            for (let y = 0; y < gridHeight; y++) {
                if (grid[x][y].color === color) {
                    cells.push({ x: x, y: y });
                }
            }
        }
        return cells;
    }
    function pheromoneEvaporation() {
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                grid[i][j].pheromone = (1 - rho) * grid[i][j].pheromone
            }
        }
    }

    const walls = {
        color: "#2d2d2d",
        horz: {
            width: gridWidth,
            height: 2,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: gridHeight - 2 }
            ]
        },
        vert: {
            width: 2,
            height: gridHeight,
            positions: [
                { x: 0, y: 0 },
                { x: gridWidth - 2, y: 0 }
            ]
        },
    }
    const windows = {
        width: 2,
        height: 20,
        color: windowColor,
        positions: [
            { x: 0, y: 10 },
            { x: 0, y: 45 },
            { x: 0, y: 80 }
        ]
    }
    const door = {
        color: "#02b200",
        x: gridWidth - 2,
        y: 90,
        width: 2,
        height: 15
    }
    const obstacles = {
        pillars: {
            color: "#2d2d2d",
            width: 3,
            height: 15,
            positions: [
                { x: 2, y: 30 },
                { x: 2, y: 65 },
                { x: gridWidth - 5, y: 30 },
                { x: gridWidth - 5, y: 41 },
                { x: gridWidth - 5, y: 53 },
                { x: gridWidth - 5, y: 65 }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: 5,
            y: 10,
            width: 30,
            height: 10
        },
        tables: {
            width: 10,
            height: 5,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                marginX: 2,
                marginY: 10,
                marginsector: 10
            }
        }
    }
    drawElements();

    canvas.addEventListener("click", function (event) {
        startButton.removeAttribute("disabled");
        startButton.classList.remove("disabled");
        const rect = canvas.getBoundingClientRect();
        const cellX = Math.floor((event.clientX - rect.left) / cellSize);
        const cellY = Math.floor((event.clientY - rect.top) / cellSize);

        switch (grid[cellX][cellY].color) {
            case "#ccc":
                const objects = getCoords(walls.color).concat(getCoords(obstacles.teacher_table.color)).concat(getCoords(obstacles.tables.color))
                const exits = getCoords(door.color).concat(getCoords("cyan"))
                const ant = new Ant(cellX, cellY, alpha, beta, objects, exits);
                console.log(`Ha pulsado en el punto (${ant.currentX}, ${ant.currentY})`);

                ant.movement(grid);
                console.log(`La hormiga se ha desplazado al punto (${ant.currentX}, ${ant.currentY})`);
                drawElements(cellX, cellY, ant.currentX, ant.currentY);
                console.log(ant.visited)
                startingPoint = { x: cellX, y: cellY }
                break;
            case "red":
                alert("Por favor, seleccione otra ubicación o pulse el botón de marcar el punto de partida")
                break;
            default:
                alert("No puedes empezar ahí. Haz clic en el suelo de la habitación");
                break;
        }
    });
    windowsCheckbox.addEventListener("change", function () {
        windowColor = windowColor === "cyan" ? "#2d2d2d" : "cyan";
        windows.color = windowColor
        drawElements();
        startingPoint = null;
    });
    show_gridCheckbox.addEventListener("change", function () {
        drawElements();
        startingPoint = null;
    });
    show_obstaclesCheckbox.addEventListener("change", function () {
        drawElements();
        startingPoint = null;
    });
    antsRange.addEventListener("change", function () {
        ants_value.textContent = antsRange.value
    });
    document.getElementById("reset").addEventListener("click", function () {
        location.reload();
    });
};
