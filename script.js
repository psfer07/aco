import { gridWidth, gridHeight, cellSize, room } from './roomConfig.js';
window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    let start;
    let hasStarted = false;
    let grid = [];
    const properties = { // Each cell will have these properties by default
        color: "#ccc",
        pheromone: 1.0
    }
    for (let x = 0; x < gridWidth; x++) {
        let cols = [];
        for (let y = 0; y < gridHeight; y++) {
            cols.push({ ...properties });
        }
        grid.push(cols);
    }

    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    class Ant {
        constructor(x, y, visited, obstacle, alpha, beta, deposit) {
            this.x = x;
            this.y = y;
            this.visited = visited;
            this.obstacle = obstacle;
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

            for (let i = 0; i < directions.length; i++) {
                const invertedDistance = (Math.abs(directions[i].x) + Math.abs(directions[i].y)) === 2 ? 1 / Math.sqrt(2) : 1;
                const weigh = Math.pow(pheromone[i], this.alpha) * Math.pow(invertedDistance, this.beta); // Generic cost calculation formula for Ant Colony Optimization systems
                weighs.push(weigh);
            }

            const lastVisitedCellIndex = this.directions.findIndex(direction =>
                this.visited[this.visited.length - 1].x === this.x - direction.x &&
                this.visited[this.visited.length - 1].y === this.y - direction.y
            );
            if (lastVisitedCellIndex > 0) weighs[lastVisitedCellIndex - 1] /= 3;
            if (lastVisitedCellIndex < 0) weighs[lastVisitedCellIndex + 1] /= 3;


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
            return this.directions.filter(direction => {
                const newX = x + direction.x;
                const newY = y + direction.y;
                const isObject = this.obstacle.some(object => newX === object.x && newY === object.y);
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
                try {
                    if (grid[i][j].color != color) {
                        grid[i][j].color = color;
                        paint.fillStyle = grid[i][j].color;
                        paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                    }
                } catch (error) {
                    new Error(`Error setting the cell (${i}, ${j}) as color ${color}`);
                    return;
                }
            }
        }
    }
    function drawRoom() {
        const { walls, windows, door, obstacles } = room;
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
    function getObjects(object) {
        let objects = [];
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                if (!object.some(object => grid[i][j].color === object)) objects.push({ x: i, y: j });
            }
        }
        return objects;
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
                    let ant = new Ant(x, y, visited, objects, state ? Math.pow(alpha, 2) : alpha, beta, deposit); // As ants usually follow its own path after finding food
                    let dirs = ant.getDirs(x, y);
                    if (dirs.length === 0) {
                        let newdirs = [];
                        do {
                            let revert = ant.revertMove();
                            deadEnds.push(revert.avoid);
                            [x, y] = [revert.x, revert.y];
                            newdirs = ant.getDirs(x, y, deadEnds);
                        } while (newdirs.length < 1); // Reverts its position until it has more than one available directions to move
                        ant.x = x;
                        ant.y = y;
                        dirs = newdirs;
                    }

                    const [movedTo, distance] = ant.move(grid, dirs);
                    moveCount++;
                    visited.push({ x: movedTo.x, y: movedTo.y });

                    // Evaporate pheromones every 20 moves
                    if (moveCount % 20 === 0) {
                        for (const visit of visited) {
                            grid[visit.x][visit.y].pheromone *= (1 - rho); // Applying evaporation
                            if (grid[visit.x][visit.y].pheromone < 0.00001) grid[visit.x][visit.y].pheromone = 0; // Avoid floating-point precision issues
                        }
                    }

                    setColor(movedTo.x, movedTo.y, state ? "green" : "darkgreen");
                    setColor([start.x - 1, start.x + 1], [start.y - 1, start.y + 1], "red");
                    [x, y] = [movedTo.x, movedTo.y];
                    ant.x = movedTo.x;
                    ant.y = movedTo.y;
                    distanceCumulative += distance;
                    if (bestDistance < distanceCumulative) {
                        console.log("Cumulative distance exceeded best distance. Restarting ant.");
                        drawRoom();
                        for (const visit of oldVisited) { setColor(visit.x, visit.y, !state ? "green" : "darkgreen") }

                        // Reset variables for retry
                        moveCount = 0;
                        distanceCumulative = 0;
                        x = initial.x;
                        y = initial.y;
                        ant.x = x;
                        ant.y = y;
                        visited = [initial];
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
        let obstacles = [];
        let newVisited, oldVisited = [];
        hasStarted = true;

        for (let i = 0; i < steps; i++) {
            try {
                let freespaces = ["#ccc", "red", "green", "darkgreen", "#02b200"];
                console.log(`Step nº ${i + 1} of ${steps}`);

                obstacles = getObjects(freespaces);
                [currentPoint, newDistance, newVisited] = await antStart(1, start, currentPoint, alpha, beta, rho, deposit, obstacles, oldDistance, oldVisited);
                if (newDistance < oldDistance || oldDistance === undefined) {
                    oldDistance = newDistance;
                    for (const visit of newVisited) { setColor(visit.x, visit.y, "green") };
                }
                oldVisited = newVisited;
                newVisited = [];
                obstacles = [];
                freespaces.pop(); // Remove door as free space for the ant

                obstacles = getObjects(freespaces);
                [currentPoint, newDistance, newVisited] = await antStart(0, start, currentPoint, alpha, beta, rho, deposit, obstacles, oldDistance, oldVisited);

                if (newDistance < oldDistance) {
                    oldDistance = newDistance;
                    for (const visit of newVisited) { setColor(visit.x, visit.y, "darkgreen") };
                }
                oldVisited = newVisited;
                newVisited = [];
                obstacles = [];

            } catch (error) {
                console.log("Error in simulation:", error.message);
                return;
            }
        }
    }

    drawRoom(); // Initial room renderization
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
            console.log(`Coordenates set in cell (${start.x}, ${start.y})`);
            drawRoom();
            setColor([start.x - 1, start.x + 1], [start.y - 1, start.y + 1], "red");
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
            runSimulations(start,
                Number(document.getElementById("alpha").value),
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
