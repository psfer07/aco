import { gridWidth, gridHeight, room } from './src/Class layout.js';
window.onload = function () {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
    const canvas = document.getElementById("canvas");
    const paint = canvas.getContext("2d");
    const [startingPoint, startingAnt, returningAnt] = ["red", "green", "darkgreen"];
    let start;
    let stepNumber = 0;
    let cellSize = 4;
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

    document.getElementById("widget_status").textContent = "Detenida";
console.log(canvas.width)
console.log(canvas.height)
    // Set canvas size
    canvas.width = gridWidth * cellSize;
    canvas.height = gridHeight * cellSize;

    class Ant {
        constructor(x, y, visited, obstacle, alpha, beta, deposit, gridWidth, gridHeight) {
            this.x = x;
            this.y = y;
            this.visited = visited;
            this.obstacle = obstacle;
            this.alpha = alpha;
            this.beta = beta;
            this.deposit = deposit;
            this.godQuotient = (gridWidth + gridHeight) / 200;
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
        _calcCost(pheromone, directions, goal) {
            function calcProbabilities(weighs) {
                let sum = 0;
                for (let i = 0; i < weighs.length; i++) { sum += weighs[i]; }
                const probabilities = [];
                for (let i = 0; i < weighs.length; i++) { probabilities[i] = weighs[i] / sum; }
                return probabilities; // Current case by all possible cases
            }
            function moduleToGoal(x, y) {
                const distance = Math.sqrt(Math.pow(goal.x - x, 2) + Math.pow(goal.y - y, 2)); // Euclidean formula
                return distance;
            }

            let weighs = [];
            let distance = Infinity;
            let bestDirectionIndex = 0;

            for (let i = 0; i < directions.length; i++) {
                const euclideanDistance = moduleToGoal(this.x + directions[i].x, this.y + directions[i].y);
                const invertedDistance = (Math.abs(directions[i].x) + Math.abs(directions[i].y)) === 2 ? 1 / Math.sqrt(2) : 1;
                let weigh = Math.pow(pheromone[i], this.alpha) * Math.pow(invertedDistance, this.beta); // Generic cost calculation formula for Ant Colony Optimization systems

                weighs.push(weigh);

                if (euclideanDistance < distance) {
                    distance = euclideanDistance;
                    bestDirectionIndex = i;
                }
            }

            weighs[bestDirectionIndex] += this.godQuotient; // Algorithm improvement aside the original ACO algorithm

            const lastVisitedCellIndex = this.directions.findIndex(direction =>
                this.visited[this.visited.length - 1].x === this.x - direction.x &&
                this.visited[this.visited.length - 1].y === this.y - direction.y
            );
            if (lastVisitedCellIndex > 0) weighs[lastVisitedCellIndex - 1] /= 3;
            if (lastVisitedCellIndex < 0) weighs[lastVisitedCellIndex + 1] /= 3;


            const probabilities = calcProbabilities(weighs);
            const rand = Math.random();
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
                const isObject = this.obstacle.some(object => newX === object.x && newY === object.y);
                const isVisited = this.visited.some(visit => newX === visit.x && newY === visit.y);
                const isAvoided = avoid && avoid.some(deadEnd => deadEnd.x === newX && deadEnd.y === newY);

                return !isObject && !isVisited && !isAvoided;
            });
        }
        move(grid, directions, goal) {
            const total_pheromone = directions.map(direction => {
                const inX = this.x + direction.x;
                const inY = this.y + direction.y;
                return grid[inX][inY].pheromone;
            });

            const index = this._calcCost(total_pheromone, directions, goal);
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

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            document.getElementById('theme-icon').src = './src/dark.svg';
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            document.getElementById('theme-icon').src = './src/light.svg';
        }
        window.applyTheme = applyTheme;
    }
    function setColor(x, y, color) {
        const X = Array.isArray(x) ? x[0] : x;
        const endX = Array.isArray(x) ? x[0] + x[1] : x;
        const Y = Array.isArray(y) ? y[0] : y;
        const endY = Array.isArray(y) ? y[0] + y[1] : y;

        for (let i = X; i <= endX; i++) {
            for (let j = Y; j <= endY; j++) {
                try {
                    if (grid[i][j].color != color) {
                        grid[i][j].color = color;
                        paint.fillStyle = grid[i][j].color;
                        paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                    }
                } catch (error) {
                    console.error(`Error setting the cell (${i}, ${j}) as color ${color}`);
                    return;
                }
            }
        }
    }
    function drawElements() {
        const { floor, walls, windows, exit, elements } = room;
        for (const item in room) {
            switch (item) {
                case 'floor':
                    setColor([floor.margin, floor.width - floor.margin], [floor.margin, floor.height - floor.margin], floor.color);
                    break;
                case 'walls':
                    for (const wall of walls.horz.positions) { setColor([wall.x, walls.horz.width - 1], [wall.y, walls.horz.height - 1], walls.color); }
                    for (const wall of walls.vert.positions) { setColor([wall.x, walls.vert.width - 1], [wall.y, walls.vert.height - 1], walls.color); }
                    break;
                case 'windows':
                    for (const window of windows.positions) { setColor([window.x, windows.width - 1], [window.y, windows.height - 1], windows.color); }
                    break;
                case 'exit':
                    setColor([exit.x, exit.width - 1], [exit.y, exit.height - 1], exit.color);
                    break;
                case 'elements':
                    for (const key in elements) {
                        switch (key) {
                            case 'pillars':
                                const pillars = elements.pillars;
                                for (const pillar of pillars.positions) { setColor([pillar.x, pillars.width - 1], [pillar.y, pillars.height - 1], pillars.color); }
                                break;
                            case 'teacher_table':
                                const Ttable = elements.teacher_table
                                setColor([Ttable.x, Ttable.width - 1], [Ttable.y, Ttable.height - 1], Ttable.color);
                                break;
                            case 'tables':
                                const table = elements.tables;
                                for (let i = 0; i < table.sectors.count; i++) {
                                    const sectorX = table.margins.sectorMargin * i + table.margins.initialMarginX;
                                    for (let col = 0; col < table.sectors.cols; col++) {
                                        const tableX = sectorX + col * (table.width + table.margins.marginX);
                                        for (let row = 0; row < table.sectors.rows; row++) {
                                            const tableY = row * (table.margins.marginY + table.height) + table.margins.initialMarginY;
                                            setColor([tableX, table.width], [tableY, table.height], table.color);
                                        }
                                    }
                                }
                                break;
                        }
                    }
                    break;
                default:
                    console.warn("This element is not currently supported, so review it before trying to import it :)")
                    break;
            }
        }
    }
    function getObjects(object) {
        let objects = [];
        if (Array.isArray(object)) {
            for (let i = 0; i < gridWidth; i++) {
                for (let j = 0; j < gridHeight; j++) {
                    if (object.some(object => grid[i][j].color === object)) objects.push({ x: i, y: j });
                }
            }
        } else {
            for (let i = 0; i < gridWidth; i++) {
                for (let j = 0; j < gridHeight; j++) {
                    if (grid[i][j].color === object) objects.push({ x: i, y: j });
                }
            }
        }
        return objects;
    }
    function antStart(state, start, initial, alpha, beta, rho, deposit, objects) {
        return new Promise((resolve, reject) => {
            let moveCount = 0;
            let distanceCumulative = 0;
            let { x, y } = initial;
            let visited = [{ x, y }];
            let deadEnds = [];
            let ant = new Ant(x, y, visited, objects, state ? Math.pow(alpha, 2) : alpha, beta, deposit, gridWidth, gridHeight);

            function moveAnt() {
                function getNearestPoint(x0, y0, objects) {
                    let nearest = {};
                    let currentDistance = Infinity;

                    for (const object of objects) {
                        const distance = Math.sqrt(Math.pow(object.x - x0, 2) + Math.pow(object.y - y0, 2));
                        if (distance < currentDistance) {
                            nearest = { x: object.x, y: object.y };
                            currentDistance = distance;
                        } else {
                            break;
                        }
                    }
                    return nearest;
                }

                try {
                    let dirs = ant.getDirs(x, y);
                    if (dirs.length === 0) {
                        let newdirs = [];
                        do {
                            let revert = ant.revertMove();
                            deadEnds.push(revert.avoid);
                            [x, y] = [revert.x, revert.y];
                            newdirs = ant.getDirs(x, y, deadEnds);
                        } while (newdirs.length < 1);
                        ant.x = x;
                        ant.y = y;
                        dirs = newdirs;
                    }
                    let nearestPoint = getNearestPoint(x, y, getObjects(state ? room.exit.color : startingPoint));
                    const [movedTo, distance] = ant.move(grid, dirs, nearestPoint);
                    moveCount++;
                    visited.push({ x: movedTo.x, y: movedTo.y });

                    // Evaporate pheromones every 20 moves
                    if (moveCount % 20 === 0) {
                        for (const visit of visited) {
                            grid[visit.x][visit.y].pheromone *= (1 - rho);
                            if (grid[visit.x][visit.y].pheromone < 0.00001) grid[visit.x][visit.y].pheromone = 0;
                        }
                    }

                    [x, y] = [movedTo.x, movedTo.y];
                    ant.x = movedTo.x;
                    ant.y = movedTo.y;
                    distanceCumulative += distance;

                    // Loop exit
                    if (ant.checkExit(grid, state)) { resolve([{ x, y }, distanceCumulative, visited]); return; }

                    // Update canvas
                    setColor(x, y, state ? startingAnt : returningAnt);
                    setColor([start.x - 1, 2], [start.y - 1, 2], startingPoint);

                    // Speed regulation
                    if (moveCount % Number(document.getElementById("ant_speed").value) === 0 &&
                        Number(document.getElementById("ant_speed").value) != Number(document.getElementById("ant_speed").max)) requestAnimationFrame(moveAnt);
                    else moveAnt(); // Continue the loop
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
        let [oldDistance, newDistance] = [0, Infinity];
        let elements = [];
        let visited = [];
        let bestPath = [];
        document.getElementById("widget_status").textContent = "En ejecucción";

        // Reset trace through simulations
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                if (grid[i][j].pheromone != 1.0) grid[i][j].pheromone = 1.0;
            }
        }

        for (stepNumber = 0; stepNumber < steps; stepNumber++) {
            try {
                let stringPath = '';
                let objects = [room.walls.color, room.windows.color, room.elements.tables.color, room.elements.teacher_table.color];
                drawElements();
                for (const path of bestPath) { setColor(path.x, path.y, startingAnt) };
                document.getElementById("widget_step").textContent = `${stepNumber + 1} de ${steps}`;

                elements = getObjects(objects);
                [currentPoint, newDistance, visited] = await antStart(1, start, currentPoint, alpha, beta, rho, deposit, elements);
                if (newDistance < oldDistance || oldDistance == 0) {
                    oldDistance = newDistance;
                    bestPath = visited;
                }
                for (const path of bestPath) setColor(path.x, path.y, startingAnt);
                visited = [];
                elements = [];
                objects.push(room.exit.color); // Added the exit as an object for the ant to avoid

                elements = getObjects(objects);
                [currentPoint, newDistance, visited] = await antStart(0, start, currentPoint, alpha, beta, rho, deposit, elements);
                if (newDistance < oldDistance) {
                    oldDistance = newDistance;
                    bestPath = visited;
                }

                visited = [];
                elements = [];
                for (const path of bestPath) {
                    setColor(path.x, path.y, startingPoint);
                    stringPath += `(${path.x}, ${path.y}), `;
                }
                stringPath = stringPath.substring(0, stringPath.length - 2); // Remove the last comma and space
                document.getElementById("widget_visited").value = stringPath
                document.getElementById("widget_distance").textContent = oldDistance;

            } catch (error) {
                alert("Error in simulation:", error.message);
                return;
            }
        }
        document.getElementById("widget_status").textContent = "Detenida"
        drawElements();
        for (const path of bestPath) setColor(path.x, path.y, startingAnt);
    }

    applyTheme(darkThemeMq.matches);
    drawElements(); // Initial room renderization

    // Listen for changes in the color scheme preference
    darkThemeMq.addEventListener("change", e => {
        applyTheme(e.matches);
    });
    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        start = {
            x: Math.floor((event.clientX - rect.left) / cellSize),
            y: Math.floor((event.clientY - rect.top) / cellSize)
        };
        document.getElementById("widget_status").textContent = "Detenida";
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
            drawElements();
            setColor([start.x - 1, 2], [start.y - 1, 2], "#ff0101");
        } else {
            if (grid[start.x][start.y].color === startingPoint) {
                alert("Por favor, seleccione otro punto o inicie la simulación.")
            } else { alert("No puedes empezar ahí. Haz clic en el suelo de la habitación."); }
        }
    });
    document.getElementById("start").addEventListener("click", function () {
        if (start && document.getElementById("widget_status").textContent == "Detenida") {
            runSimulations(start,
                Number(document.getElementById("alpha").value),
                Number(document.getElementById("beta").value),
                Number(document.getElementById("rho").value),
                Number(document.getElementById("deposit").value),
                Number(document.getElementById("steps").value)
            );
        } else {
            if (document.getElementById("widget_status").textContent == "En ejecucción") {
                alert("Espera a que la simulación actual termine o reinicia el simulador.")
            } else {
                alert("Debes tener seleccionado un punto de partida antes the iniciar la simulación.");
            }
        }
    });
};
