window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const gridWidth = 180;
    const gridHeight = 200;
    const cellSize = 4;
    const objects = [];
    let start;
    let grid = [];
    let properties = { // Each cell will have these properties by default
        color: "#ccc",
        pheromone: 1.0
    };
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

    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    // Create matrix
    let gradientX = 0;
    for (let x = 0; x < gridWidth; x++) {
        let cols = [];
        let gradientY = 0;
        gradientX += 0.00015;
        for (let y = 0; y < gridHeight; y++) {
            gradientY += 0.00015;
            properties.pheromone = properties.pheromone + gradientX * gradientY;
            cols.push({ ...properties });
        }
        grid.push(cols);
    }

    class Ant {
        constructor(x, y, visited, objects, alpha, beta, deposit) {
            this.x = x;
            this.y = y;
            this.visited = visited;
            this.objects = objects;
            this.alpha = alpha;
            this.beta = beta;
            this.deposit = deposit;
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
            let costs = [];

            for (let i = 0; i < directions.length; i++) {
                const distance = (Math.abs(directions[i].x) + Math.abs(directions[i].y)) === 2 ? Math.sqrt(2) : 1;
                const cost = Math.pow(pheromone[i], this.alpha) * Math.pow(1 / distance, this.beta);
                costs.push(cost);
            }

            const costSum = costs.reduce((sum, value) => sum + value, 0);
            const probabilities = costs.map(cost => cost / costSum);

            let rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < probabilities.length; i++) {
                cumulative += probabilities[i];
                if (rand < cumulative) {
                    return i;
                }
            }
        }
        getDirs(x, y, avoid) {
            if (!(x && y)) {
                x = this.x;
                y = this.y;
            }
            return this.directions.filter(direction => {
                const newX = x + direction.x;
                const newY = y + direction.y;
                const isObject = this.objects.some(object => newX === object.x && newY === object.y);
                const isVisited = this.visited.some(visit => newX === visit.x && newY === visit.y);
                const isAvoided = avoid && avoid.some(deadEnd => deadEnd.x === newX && deadEnd.y === newY);

                return !isObject && !isVisited && !isAvoided;
            });
        }
        move(grid, directions) {
            const total_pheromone = directions.map(direction => {
                const inX = this.x + direction.x;
                const inY = this.y + direction.y;
                return grid[inX][inY].pheromone;
            });

            const index = this._calcCost(total_pheromone, directions);
            const newX = this.x + directions[index].x;
            const newY = this.y + directions[index].y;
            grid[newX][newY].pheromone += this.deposit;

            // Update ant's position and visited path
            this.visited.push({ x: this.x, y: this.y });
            this.x = newX;
            this.y = newY;

            return { x: newX, y: newY };
        }
        revertMove() {
            const deadEnd = this.visited.pop(); // Remove from visited the last element
            const { x, y } = this.visited[this.visited.length - 1]; // Get the new last element
            return { x: x, y: y, avoid: deadEnd };
        }
        checkExit(x, y, grid, state) {
            if (!(x && y)) {
                x = this.x;
                y = this.y;
            }
            const color = state ? "#02b200" : "red";
            return this.directions.some(direction => {
                const exitX = x + direction.x;
                const exitY = y + direction.y;
                return grid[exitX][exitY].color === color;
            });
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
    function drawCells(reload) {
        if (!reload) {
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
        }
        // Paints each cell with its corresponding color
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    function antStart(state, initial, alpha, beta, rho, deposit) {
        let i = 0;
        let { x, y } = initial;
        let visited = [];
        let deadEnds = [];
        visited.push({ x: x, y: y });

        async function moveAnt() {
            let ant = new Ant(x, y, visited, objects, alpha, beta, deposit);
            let dirs = ant.getDirs(x, y);
            if (dirs.length === 0) {
                let newdirs = [];
                do {
                    let revert = ant.revertMove()
                    deadEnds.push(revert.avoid);
                    [x, y] = [revert.x, revert.y];
                    newdirs = ant.getDirs(x, y, deadEnds);
                } while (newdirs.length < 1)
                ant.x = x;
                ant.y = y;
                dirs = newdirs;
            }
            const movedTo = ant.move(grid, dirs);
            if (i % 50 === 0) { // Evaporates pheromone every 50 iterations
                for (let i = 0; i < gridWidth; i++) {
                    for (let j = 0; j < gridHeight; j++)
                        grid[i][j].pheromone = (1 - rho) * grid[i][j].pheromone;
                }
            }
            i++;
            visited.push({ x: movedTo.x, y: movedTo.y });
            setColor(movedTo.x, movedTo.y, state ? "green" : "darkgreen");
            drawCells(1);
            [x, y] = [movedTo.x, movedTo.y];
            // If the exit is found
            if (ant.checkExit(x, y, grid, state)) {
                // callback; // Simulation done
                console.log(x, y, visited[visited.length - 1]);
                return { x: x, y: y };
            }
            requestAnimationFrame(moveAnt); // Continue the loop
        }
        requestAnimationFrame(moveAnt); // Start the loop
    }
    async function runSimulations(start, alpha, beta, rho, deposit, steps) {
        let currentPoint = start;
        for (let i = 0; i < 1; i++) {
            console.log("Iteración nº", i + 1, "of", steps);
            console.log("Before", currentPoint, start);
            currentPoint = antStart(1, currentPoint, alpha, beta, rho, deposit); // Update current point
            console.log("After", currentPoint, start);
            antStart(0, currentPoint, alpha, beta, rho, deposit); // Use the returned point as new start
        }
    }

    drawCells();
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            if (grid[i][j].color != "#ccc" && grid[i][j].color != "red" && grid[i][j].color != "green" && grid[i][j].color != "#02b200") { objects.push({ x: i, y: j }); }
        }
    }
    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        start = {
            x: Math.floor((event.clientX - rect.left) / cellSize),
            y: Math.floor((event.clientY - rect.top) / cellSize)
        };
        let state = true;
        for (let i = start.x - 1; i <= start.x + 1; i++) {
            for (let j = start.y - 1; j <= start.y + 1; j++) {
                if (grid[i][j].color != "#ccc") {
                    state = false;
                }
            }
        }
        if (state) {
            console.log("Coordenadas establecidas en:", start.x, start.y);
            drawCells();
            setColor([start.x - 1, start.x + 1], [start.y - 1, start.y + 1], "red")
            drawCells(1);
        } else {
            if (grid[start.x][start.y].color === "red") {
                alert("Por favor, seleccione otro punto o inicie la simulación.")
            } else { alert("No puedes empezar ahí. Haz clic en el suelo de la habitación."); }
        }
    });
    document.getElementById("reset").addEventListener("click", function () {
        location.reload();
    });
    document.getElementById("start").addEventListener("click", function () {
        if (start) {
            runSimulations(start, Number(document.getElementById("alpha").value),
                Number(document.getElementById("beta").value),
                Number(document.getElementById("rho").value),
                Number(document.getElementById("deposit").value),
                Number(document.getElementById("steps").value));
            start = false;
        } else {
            if (start === false) {
                alert("Espera a que la simulación actual termine o reinicia el simulador.")
            } else {
                alert("Debes tener seleccionado un punto de partida antes the iniciar la simulación.");
            }
        }
    });
};
