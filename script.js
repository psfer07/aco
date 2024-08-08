window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const windowsCheckbox = document.getElementById("windows");
    const show_obstaclesCheckbox = document.getElementById("show_obstacles");
    const antsRange = document.getElementById("ants");
    const ants_value = document.getElementById("ants_value");
    const startButton = document.getElementById("start");
    const rho = document.getElementById("rho");
    const alpha = document.getElementById("alpha");
    const heuristic = document.getElementById("heuristic");
    const gridWidth = 400;
    const gridHeight = 440;
    const cellSize = 2;
    let HasSimStarted = false;
    let windowColor = "cyan";
    let startingPoint, exits = null
    let grid = createGrid()

    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    class Ant {
        constructor(startX, startY, alpha, heuristic, obstacles, exits) {
            this.currentX = startX; // Actual coord (x)
            this.currentY = startY; // Actual coord (y)
            this.visited = [{ x: startX, y: startY }]; // Cells where the ant passes
            this.alpha = alpha; // Influence of pheromone
            this.heuristic = heuristic; // Influence of heuristic
            this.obstacles = obstacles; // Cells marked as obstacles
            this.exits = exits; // Cells marked as exits
        }
        movement(grid) {
            const check_visited = (newX, newY, visites) => {
                return !visites.some(visit => visit.x === newX && visit.y === newY);
            };

            const directions = [
                { dx: 0, dy: -1 },  // Up
                { dx: 0, dy: 1 },   // Down
                { dx: -1, dy: 0 },  // Left
                { dx: 1, dy: 0 }    // Right
            ];

            // Filter all the available directions from the new position
            const availableDirections = directions.filter(direction => {
                const newX = this.currentX + direction.dx;
                const newY = this.currentY + direction.dy;
                return (
                    newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[0].length &&  // Ensure the new cell is inside the grid
                    !this.visited.some(visited => visited.x === newX && visited.y === newY) && // Ensure the new cell hasn't been visited
                    !this.obstacles.some(obstacle => obstacle.x === newX && obstacle.y === newY) // Ensure the new cell isn't an obstacle
                );
            });

            // If no directions are available, stop movement or choose a fallback
            if (availableDirections.length === 0) {
                console.log("No valid moves available for the ant.");
                return; // Exit the function or handle this case differently
            }

            // Choose a random move from the available directions
            const move = availableDirections[Math.floor(Math.random() * availableDirections.length)];

            const condition = check_visited(this.currentX + move.dx, this.currentY + move.dy, this.visited) &&
                this.visited.length < 10000 &&
                !this.exits.some(exit => exit.x === this.currentX && exit.y === this.currentY);

            if (condition) {
                let available_pheromone = [];
                for (const direction of availableDirections) {
                    const x = this.currentX + direction.dx;
                    const y = this.currentY + direction.dy;
                    available_pheromone.push(grid[x][y].pheromone);
                }

                this.currentX += move.dx;
                this.currentY += move.dy;
                this.visited.push({ x: this.currentX, y: this.currentY });

                grid[this.currentX][this.currentY].pheromone += this.heuristic; // Update the pheromone on the new cell
            }
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
                    const tableY = 100 + row * (table.margins.marginY + table.height);
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
    function drawElements(x, y, visited) {
        drawRoom();
        setColor([x - 2, x + 2], [y - 2, y + 2], "red");
        if (visited) {
            for (let i = 0; i < visited.length; i++) {
                setColor(visited[i].x, visited[i].y, "green")
            }
        }
        show_obstaclesCheckbox.checked ? drawObstacles() : false
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
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
            height: 8,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: gridHeight - 8 }
            ]
        },
        vert: {
            width: 8,
            height: gridHeight,
            positions: [
                { x: 0, y: 0 },
                { x: gridWidth - 8, y: 0 }
            ]
        },
    }
    const windows = {
        width: 8,
        height: 80,
        color: windowColor,
        positions: [
            { x: 0, y: 40 },
            { x: 0, y: 180 },
            { x: 0, y: 320 }
        ]
    }
    const door = {
        color: "#02b200",
        x: gridWidth - 8,
        y: 360,
        width: 8,
        height: 60
    }
    const obstacles = {
        pillars: {
            color: "#2d2d2d",
            width: 12,
            height: 60,
            positions: [
                { x: 8, y: 120 },
                { x: 8, y: 260 },
                { x: gridWidth - 20, y: 120 },
                { x: gridWidth - 20, y: 164 },
                { x: gridWidth - 20, y: 212 },
                { x: gridWidth - 20, y: 260 }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: 20,
            y: 40,
            width: 120,
            height: 40
        },
        tables: {
            width: 40,
            height: 20,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                marginX: 8,
                marginY: 40,
                marginsector: 40
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
                const ant = new Ant(cellX, cellY, alpha, heuristic, objects, exits);
                console.log(`Ha pulsado en el punto (${ant.currentX}, ${ant.currentY})`);

                ant.movement(grid);
                console.log(`La hormiga se ha desplazado al punto (${ant.currentX}, ${ant.currentY})`);
                drawElements(cellX, cellY, ant.visited);
                pheromoneEvaporation()
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
