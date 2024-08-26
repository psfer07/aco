window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const gridWidth = 180;
    const gridHeight = 200;
    const cellSize = 4;
    let start;
    let hasStarted = false;
    let grid = [];
    for (let x = 0; x < gridWidth; x++) {
        let cols = [];
        for (let y = 0; y < gridHeight; y++) {
            cols.push({ ...properties });
        }
        grid.push(cols);
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

    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    class Ant {
        constructor(x, y, visited, objects, alpha, beta, deposit) {
            this.x = x;
            this.y = y;
            this.visited = visited;
            this.objects = objects;
            this.alpha = alpha;
            this.beta = beta;
            this.deposit = deposit;
            this.directions = [  // Directions are set clockwise
                { x: 0, y: -1 }, // Up
                { x: 1, y: -1 }, // Up-right
                { x: 1, y: 0 },  // Right
                { x: 1, y: 1 },  // Down-right
                { x: 0, y: 1 },  // Down
                { x: -1, y: 1 }, // Down-left
                { x: -1, y: 0 }, // Left
                { x: -1, y: -1 } // Up-left
            ];
        }
        _calcCost(pheromone, directions) {
            let weighs = [];

            // Generic cost calculation formula for Ant Colony Systems
            for (let i = 0; i < directions.length; i++) {
                const distance = (Math.abs(directions[i].x) + Math.abs(directions[i].y)) === 2 ? Math.sqrt(2) : 1;
                const weigh = Math.pow(pheromone[i], this.alpha) * Math.pow(1 / distance, this.beta);
                weighs.push(weigh);
            }

            const lastVisitedCellIndex = this.directions.findIndex(direction =>
                this.visited[this.visited.length - 1].x === this.x - direction.x &&
                this.visited[this.visited.length - 1].y === this.y - direction.y
            );

            if (lastVisitedCellIndex > 0) { weighs[lastVisitedCellIndex - 1] /= 2; }
            if (lastVisitedCellIndex < weighs.length - 1) { weighs[lastVisitedCellIndex + 1] /= 2; }


            const probabilities = this._calcProbabilities(weighs);
            const rand = Math.random();
            let cumulative = 0;
            for (let i = 0; i < probabilities.length; i++) {
                cumulative += probabilities[i];
                if (rand < cumulative) {
                    return i;
                }
            }
        }
        _calcProbabilities(weighs) {
            let sum = 0;
            for (let i = 0; i < weighs.length; i++) { sum += weighs[i]; }
            const probabilities = [];
            for (let i = 0; i < weighs.length; i++) { probabilities[i] = weighs[i] / sum; }
            return probabilities; // Current case by all possible cases

        }
        getDirs(x, y, avoid) {
            if (!(x && y)) {
                x = this.x;
                y = this.y;
            }
            let availableDirections = [];
            for (const direction of this.directions) {
                const newX = x + direction.x;
                const newY = y + direction.y;

                let isObject = false;
                for (let i = 0; i < this.objects.length; i++) {
                    if (newX === this.objects[i].x && newY === this.objects[i].y) { isObject = true; break; }
                }

                let isVisited = false;
                for (let i = 0; i < this.visited.length; i++) {
                    if (newX === this.visited[i].x && newY === this.visited[i].y) { isVisited = true; break; }
                }

                let isAvoided = false;
                if (avoid) {
                    for (let i = 0; i < avoid.length; i++) {
                        if (newX === avoid[i].x && newY === avoid[i].y) { isAvoided = true; break; }
                    }
                }
                if (!(isObject && isVisited && isAvoided)) availableDirections.push(direction);
            }
            return availableDirections;
        }
        move(grid, directions) {
            let total_pheromone = [];
            for (const direction of directions) {
                const inX = this.x + direction.x;
                const inY = this.y + direction.y;
                total_pheromone.push(grid[inX][inY].pheromone)
            }

            const index = this._calcCost(total_pheromone, directions);
            const newX = this.x + directions[index].x;
            const newY = this.y + directions[index].y;
            grid[newX][newY].pheromone += this.deposit;

            // Update ant's position and visited path
            this.x = newX;
            this.y = newY;
            const distance = (Math.abs(directions[index].x) + Math.abs(directions[index].y)) === 2 ? Math.sqrt(2) : 1;
            return [{ x: newX, y: newY }, distance];
        }
        revertMove() {
            const deadEnd = this.visited.pop(); // Remove from visited the last element
            const { x, y } = this.visited[this.visited.length - 1]; // Get the new last element
            return { x: x, y: y, avoid: deadEnd };
        }
        checkExit(grid, state) {
            const color = state ? "#02b200" : "red";
            let isExit = false;
            for (const direction of this.directions) {
                const exitX = this.x + direction.x;
                const exitY = this.y + direction.y;
                if (grid[exitX][exitY].color === color) {
                    isExit = true;
                    break;
                }
            }
            return isExit;
        }
    }

    function setColor(x, y, color) {
        const X = Array.isArray(x) ? x[0] : x;
        const endX = Array.isArray(x) ? x[1] : x;
        const Y = Array.isArray(y) ? y[0] : y;
        const endY = Array.isArray(y) ? y[1] : y;

        for (let i = X; i <= endX; i++) {
            for (let j = Y; j <= endY; j++) {
                if (grid[i][j].color != color) grid[i][j].color = color;
            }
        }
    }
    function drawCells(reload) {
        if (!reload) {
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
    function antStart(state, start, initial, alpha, beta, rho, deposit, objects, bestDistance, oldVisited) {
        return new Promise((resolve, reject) => {
            let moveCount = 0;
            let distanceCumulative = 0;
            let { x, y } = initial;
            let visited = [];
            let deadEnds = [];
            visited.push({ x, y });

            function moveAnt() {
                try {
                    let ant = new Ant(x, y, visited, objects, state ? Math.pow(alpha, 2) : alpha, beta, deposit);
                    let dirs = ant.getDirs(x, y);
                    if (dirs.length === 0) {
                        let newdirs = [];
                        do {
                            let revert = ant.revertMove();
                            deadEnds.push(revert.avoid);
                            x = revert.x;
                            y = revert.y;
                            newdirs = ant.getDirs(x, y, deadEnds);
                        } while (newdirs.length < 1); // Reverts its position until it has more than one available direction to move
                        dirs = newdirs;
                    }

                    const [movedTo, distance] = ant.move(grid, dirs);

                    // Evaporate pheromones every 15 moves
                    if (moveCount % 15 === 0) {
                        for (let i = 0; i < gridWidth; i++) {
                            for (let j = 0; j < gridHeight; j++) {
                                grid[i][j].pheromone *= (1 - rho); // Applying evaporation
                                if (grid[i][j].pheromone < 0.1) grid[i][j].pheromone = 0; // Avoid floating-point precision issues
                            }
                        }
                    }

                    moveCount++;
                    visited.push({ x: movedTo.x, y: movedTo.y });
                    setColor(movedTo.x, movedTo.y, state ? "green" : "darkgreen");
                    setColor([start.x - 1, start.x + 1], [start.y - 1, start.y + 1], "red");
                    drawCells(1);
                    x = movedTo.x;
                    y = movedTo.y;
                    distanceCumulative += distance;
                    if (bestDistance < distanceCumulative) {
                        console.log("Cumulative distance exceeded best distance. Restarting ant.");
                        drawCells();
                        for (const visit of oldVisited) { setColor(visit.x, visit.y, !state ? "green" : "darkgreen") }
                        drawCells(1);

                        // Reset variables for retry
                        moveCount = 0;
                        distanceCumulative = 0;
                        x = initial.x;
                        y = initial.y;
                        visited = [{ x, y }];
                        deadEnds = [];

                        // Continue the loop without resolving
                        requestAnimationFrame(moveAnt);
                        return;
                    }

                    // Check if the exit is found
                    if (ant.checkExit(grid, state)) {
                        console.log(`Exit found after ${state ? "moving" : "returning"} through ${distanceCumulative} cells`);
                        resolve([{ x, y }, distanceCumulative, visited]);
                        return;
                    }

                    requestAnimationFrame(moveAnt); // Continue the loop
                } catch (error) {
                    console.error("Error during ant movement:", error);
                    reject(error);
                }
            }
            requestAnimationFrame(moveAnt); // Start the loop
        });
    }
    async function runSimulations(start, alpha, beta, rho, deposit, steps) {
        let currentPoint = start;
        let oldDistance, newDistance = 0;
        let objects = [];
        let newVisited, oldVisited = [];
        hasStarted = true;

        for (let i = 0; i < steps; i++) {
            try {
                let freespaces = ["#ccc", "red", "green", "darkgreen", "#02b200"];
                console.log("Iteration nº", i + 1, "of", steps);

                for (let i = 0; i < gridWidth; i++) {
                    for (let j = 0; j < gridHeight; j++) {
                        for (const freespace of freespaces) {
                            if (grid[i][j].color === freespace[i]) {
                                objects.push({ x: i, y: j });
                            }
                        }
                    }
                }

                [currentPoint, newDistance, newVisited] = await antStart(1, start, currentPoint, alpha, beta, rho, deposit, objects, oldDistance, oldVisited);
                if (newDistance < oldDistance || oldDistance === undefined) {
                    oldDistance = newDistance;
                    for (const visit of newVisited) { setColor(visit.x, visit.y, "green") }
                }
                oldVisited = newVisited;
                newVisited = [];
                objects = [];
                freespaces.pop(); // Remove door as free space for the ant

                for (let i = 0; i < gridWidth; i++) {
                    for (let j = 0; j < gridHeight; j++) {
                        for (const freespace of freespaces) {
                            if (grid[i][j].color === freespace[i]) {
                                objects.push({ x: i, y: j });
                            }
                        }
                    }
                }

                [currentPoint, newDistance, newVisited] = await antStart(0, start, currentPoint, alpha, beta, rho, deposit, objects, oldDistance, oldVisited);
                if (newDistance < oldDistance) {
                    oldDistance = newDistance;
                    for (const visit of newVisited) { setColor(visit.x, visit.y, "darkgreen") }
                }
                oldVisited = newVisited;
                newVisited = [];
                objects = [];
                drawCells(1);

            } catch (error) {
                console.log("Error in simulation:", error.message);
                return;
            }
        }
    }

    drawCells(); // Initial scenario representation
    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        start = {
            x: Math.floor((event.clientX - rect.left) / cellSize),
            y: Math.floor((event.clientY - rect.top) / cellSize)
        };
        hasStarted = false;
        let state = true;
        for (let i = start.x - 1; i <= start.x + 1; i++) {
            for (let j = start.y - 1; j <= start.y + 1; j++) {
                if (grid[i][j].color != "#ccc") {
                    state = false;
                    break;
                }
            }
        }
        if (state) {
            console.log("Coordenates set in:", start.x, start.y);
            drawCells();
            setColor([start.x - 1, start.x + 1], [start.y - 1, start.y + 1], "red");
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
        if (start && !hasStarted) {
            runSimulations(start, Number(document.getElementById("alpha").value),
                Number(document.getElementById("beta").value),
                Number(document.getElementById("rho").value),
                Number(document.getElementById("deposit").value),
                Number(document.getElementById("steps").value)
            );
        } else {
            if (hasStarted) {
                alert("Espera a que la simulación actual termine o reinicia el simulador.")
            } else {
                alert("Debes tener seleccionado un punto de partida antes the iniciar la simulación.");
            }
        }
    });
};
