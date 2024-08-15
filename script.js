window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const startButton = document.getElementById("start");
    const rho = document.getElementById("rho");
    const alpha = document.getElementById("alpha");
    const beta = document.getElementById("beta");
    const deposit = document.getElementById("deposit");
    const gridWidth = 180;
    const gridHeight = 200;
    const cellSize = 4;
    let start, alreadyRunning;
    const objects = [];
    let grid = [];
    let properties = { // Each cell will have these properties by default
        color: "#ccc",
        pheromone: 1.0
    };

    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    // Create matrix
    for (let x = 0; x < gridWidth; x++) {
        let cols = [];
        for (let y = 0; y < gridHeight; y++) {
            cols.push({ ...properties });
        }
        grid.push(cols);
    }

    class Ant {
        constructor(x, y, visited, objects, alpha, beta, deposit, rho) {
            this.x = x;
            this.y = y;
            this.visited = visited;
            this.objects = objects;
            this.alpha = alpha;
            this.beta = beta;
            this.deposit = deposit;
            this.rho = rho;
            this.directions = [
                { x: 0, y: -1 }, // Up
                { x: 0, y: 1 }, // Down
                { x: -1, y: 0 }, // Left
                { x: 1, y: 0 }, // Right
                { x: -1, y: -1 }, // Up-left
                { x: 1, y: -1 }, // Up-right
                { x: -1, y: 1 }, // Down-left
                { x: 1, y: 1 }  // Down-right
            ];
        }
        _calcCost(pheromone, directions) {
            let sum = 0;
            let distances = [];
            let costs = [];

            // Set distances according to the vectors
            for (const direction of directions) {
                if (Math.abs(direction.x) + Math.abs(direction.y) === 2) { // If it moves in two directions
                    distances.push(Math.sqrt(2));
                } else {
                    distances.push(1); // Other options treated as straight lines
                }
            }

            for (let i = 0; i < directions.length; i++) {
                costs.push(Math.pow(pheromone[i], this.alpha) * Math.pow(distances[i], this.beta));
            }
            // Calculate probabilities for each value
            const costSum = costs.reduce((sum, value) => sum + value, 0);
            const probabilities = costs.map(cost => cost / costSum);
            // console.log("Costs", costs);
            // console.log("Total sum", costSum);
            // console.log("Probabilities", probabilities);
            // console.log("Pheromone levels", pheromone);
            // console.log("Distances", distances);

            for (let i = 0; i < probabilities.length; i++) {
                sum += probabilities[i];
                if (Math.random() < sum) {
                    return i;
                }
            }
        }
        move(grid) {
            let total_pheromone = [];
            let available_directions = this.directions.filter(direction => {
                return !this.objects.some(object => this.x + direction.x === object.x && this.y + direction.y === object.y) &&
                    !this.visited.some(visit => this.x + direction.x === visit.x && this.y + direction.y === visit.y);
            });
            console.log("gyat", this.x, this.y, available_directions);
            if (available_directions.length === 0) {
                console.log("Hola mundo");
                const revert = this._revertMove(available_directions);
                this.x = revert.x;
                this.y = revert.y;
                available_directions = revert.dirs;
                console.log("wasaaaaaa", this.x, this.y, this.visited[this.visited.length - 1]);
                console.log("Available directions after reverting:", available_directions.length, available_directions)
            }
            for (const direction of available_directions) {
                const inX = this.x + direction.x;
                const inY = this.y + direction.y;
                total_pheromone.push(grid[inX][inY].pheromone);
            };
            console.log("After checking dirs", this.x, this.y);
            console.log(total_pheromone, available_directions);
            const path = this._calcCost(total_pheromone, available_directions);
            console.log("Available directions:", path, available_directions.length, available_directions)

            for (const visit of this.visited) {
                grid[visit.x][visit.y].pheromone = (1 - (this.rho / 5)) * grid[visit.x][visit.y].pheromone;
            }
            const newX = this.x + available_directions[path].x;
            const newY = this.y + available_directions[path].y;
            grid[newX][newY].pheromone += this.deposit;
            return { x: newX, y: newY };
        }
        _revertMove(available_directions) {
            let lastVisited = this.visited.pop(); // Remove from visited the last element
            let { x: oldX, y: oldY } = this.visited[this.visited.length - 1]; // Get the new last element
            available_directions = this.directions.filter(direction => {
                return !this.objects.some(object => oldX + direction.x === object.x && oldY + direction.y === object.y) &&
                    !this.visited.some(visit => oldX + direction.x === visit.x && oldY + direction.y === visit.y) &&
                    !(lastVisited.x === oldX + direction.x && lastVisited.y === oldY + direction.y); // Avoid revisiting last visited
            });
            do {
                let { x: oldX, y: oldY } = this.visited[this.visited.length - 2]; // Get the new last element
                let lastVisited = this.visited.pop(); // Remove from visited the last element
                available_directions = this.directions.filter(direction => {
                    return !this.objects.some(object => oldX + direction.x === object.x && oldY + direction.y === object.y) &&
                        !this.visited.some(visit => oldX + direction.x === visit.x && oldY + direction.y === visit.y) &&
                        !(lastVisited.x === oldX + direction.x && lastVisited.y === oldY + direction.y); // Avoid revisiting last visited
                });
            } while (available_directions < 2)
            console.log("Old coords", oldX, oldY)
            console.log("Available directions left", available_directions)
            return { x: oldX, y: oldY, dirs: available_directions };
        }
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
    function drawCells(x, y, noReload) {
        if (!noReload) {
            // Floor
            setColor([2, gridWidth - 3], [2, gridHeight - 3], "#ccc");
            // Walls
            walls.horz.positions.forEach(wall => {
                setColor([wall.x, wall.x + walls.horz.width - 1], [wall.y, wall.y + walls.horz.height - 1], walls.color);
            });
            walls.vert.positions.forEach(wall => {
                setColor([wall.x, wall.x + walls.vert.width - 1], [wall.y, wall.y + walls.vert.height - 1], walls.color);
            });
            // Windows
            windows.positions.forEach(window => {
                setColor([window.x, window.x + windows.width - 1], [window.y, window.y + windows.height - 1], windows.color);
            });
            // Door
            setColor([door.x, door.x + door.width - 1], [door.y, door.y + door.height - 1], door.color);
            // Pillars
            obstacles.pillars.positions.forEach(pillar => {
                setColor([pillar.x, pillar.x + obstacles.pillars.width - 1], [pillar.y, pillar.y + obstacles.pillars.height - 1], obstacles.pillars.color);
            });
            // Teacher's table
            const Ttable = obstacles.teacher_table
            setColor([Ttable.x, Ttable.x + Ttable.width - 1], [Ttable.y, Ttable.y + Ttable.height - 1], Ttable.color);
            // Tables
            const table = obstacles.tables;
            for (let sector = 0; sector < table.sectors.count; sector++) {
                const sectorX = 2.8 * table.margins.marginsector * sector + table.margins.marginsector * 0.6;
                for (let col = 0; col < table.sectors.cols; col++) {
                    const tableX = sectorX + col * (table.width + table.margins.marginX);
                    for (let row = 0; row < table.sectors.rows; row++) {
                        const tableY = 48 + row * (table.margins.marginY + table.height);
                        setColor([tableX, tableX + table.width], [tableY, tableY + table.height], table.color);
                    }
                }
            }
            // Where the user clicks
            if (x, y) {
                setColor([x - 1, x + 1], [y - 1, y + 1], "red");
            }
        } else { setColor(x, y, "green"); }

        // Paints each cell with its corresponding color
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    function isFloor(x, y) {
        let state = true;
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (grid[i][j].color != "#ccc") {
                    state = false;
                }
            }
        }
        return state;
    }
    function antStart(initial, alpha, beta, deposit, rho) {
        alreadyRunning = true;
        const delay = 0;
        let visited = [];
        let { x, y } = initial;
        let i = 0;
        let lastTime = 0;
        visited.push({ x: x, y: y });

        function moveAnt(timestamp) {
            if (timestamp - lastTime >= delay && i < 50000) {
                const ant = new Ant(x, y, visited, objects, alpha, beta, deposit, rho);
                const movedTo = ant.move(grid);
                if (movedTo == visited[visited.length - 1]) {
                    return
                }
                visited.push({ x: movedTo.x, y: movedTo.y });
                drawCells(movedTo.x, movedTo.y, 1);
                [x, y] = [movedTo.x, movedTo.y];
                i++;
                lastTime = timestamp;
            }

            if (i < 750000) requestAnimationFrame(moveAnt); // Continue the loop
        }

        requestAnimationFrame(moveAnt); // Start the loop
    }


    const walls = {
        color: "#2d2d2d",
        horz: {
            width: gridWidth,
            height: cellSize,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: gridHeight - cellSize }
            ]
        },
        vert: {
            width: cellSize,
            height: gridHeight,
            positions: [
                { x: 0, y: 0 },
                { x: gridWidth - cellSize, y: 0 }
            ]
        },
    }
    const windows = {
        width: cellSize,
        height: 9 * cellSize,
        color: "cyan",
        positions: [
            { x: 0, y: 3 * cellSize },
            { x: 0, y: 18 * cellSize },
            { x: 0, y: 33 * cellSize }
        ]
    }
    const door = {
        color: "#02b200",
        x: gridWidth - cellSize,
        y: gridHeight - 10 * cellSize,
        width: cellSize,
        height: 7 * cellSize
    }
    const obstacles = {
        pillars: {
            color: "#2d2d2d",
            width: 2 * cellSize,
            height: 6 * cellSize,
            positions: [
                { x: cellSize, y: 12 * cellSize },
                { x: cellSize, y: 27 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 13 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 18 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 24 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 29 * cellSize }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: 4 * cellSize,
            y: 5 * cellSize,
            width: 15 * cellSize,
            height: 5 * cellSize
        },
        tables: {
            width: 4 * cellSize,
            height: 2 * cellSize,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                marginX: 2 * cellSize,
                marginY: 5 * cellSize,
                marginsector: 5 * cellSize
            }
        }
    }
    drawCells();
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            if (grid[i][j].color != "#ccc" && grid[i][j].color != "red" && grid[i][j].color != "green" && grid[i][j].color != "#02b200") { objects.push({ x: i, y: j }); }
        }
    }
    canvas.addEventListener("click", function (event) {
        startButton.removeAttribute("disabled");
        startButton.classList.remove("disabled");
        const rect = canvas.getBoundingClientRect();
        start = {
            x: Math.floor((event.clientX - rect.left) / cellSize),
            y: Math.floor((event.clientY - rect.top) / cellSize)
        };

        if (isFloor(start.x, start.y)) {
            console.log("Coordenadas establecidas en:", start.x, start.y);
            drawCells(start.x, start.y);
        } else {
            if (grid[start.x][start.y].color === "red") {
                alert("Por favor, seleccione otro punto o inicie la simulación.")
            } else { alert("No puedes empezar ahí. Haz clic en el suelo de la habitación."); }
        }
    });
    document.getElementById("reset").addEventListener("click", function () {
        location.reload();
    });
    startButton.addEventListener("click", function () {
        if (start && !alreadyRunning) { antStart(start, Number(alpha.value), Number(beta.value), Number(rho.value), Number(deposit.value)); }
        alreadyRunning = false;
    });
};
