window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const antsRange = document.getElementById("ants");
    const ants_value = document.getElementById("ants_value");
    const startButton = document.getElementById("start");
    const rho = document.getElementById("rho");
    const alpha = document.getElementById("alpha");
    const heuristic = document.getElementById("heuristic");
    const gridWidth = 360;
    const gridHeight = 400;
    const cellSize = 2;
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
        constructor(startX, startY, alpha, heuristic, id) {
            this.currentX = startX; // Actual coord (x)
            this.currentY = startY; // Actual coord (y)
            this.visited = [{ x: startX, y: startY }]; // Cells where the ant passes
            this.alpha = alpha; // Influence of pheromone
            this.heuristic = heuristic; // Influence of heuristic
            this.id = id; // Assigns an ID to the current ant
        }

        move(grid) {
            function choosePath(pheromone) {
                // Calculate the sum of all pheromone
                const totalSum = pheromone.reduce((sum, value) => sum + value, 0);

                // Calculate probabilities for each value
                const probabilities = pheromone.map(value => value / totalSum);

                // Determine which variable to choose based on the random number
                let cumulativeProbability = 0;
                for (let i = 0; i < probabilities.length; i++) {
                    cumulativeProbability += probabilities[i];
                    if (Math.random() < cumulativeProbability) {
                        return i;
                    }
                }
            }
            const directions = [
                { dx: 0, dy: -1 }, // Up
                { dx: 0, dy: 1 },  // Down
                { dx: -1, dy: 0 }, // Left
                { dx: 1, dy: 0 },  // Right
                { dx: 1, dy: 1 },  // Up-left
                { dx: 1, dy: -1 }, // Up-right
                { dx: -1, dy: 1 }, // Down-left
                { dx: 1, dy: 1 }   // Down-right
            ];

            do {
                let availableDirections;
                availableDirections = directions.filter(direction => {
                    const newX = this.currentX + direction.dx;
                    const newY = this.currentY + direction.dy;

                    // Checks if the new coords are inside the grid
                    if (newX >= 0 && newX < grid.length && newY >= 0 && newY < grid[newX].length) {
                        return grid[newX][newY].color === "#ccc" && !this.visited.some(visited => visited.x === newX && visited.y === newY); // Check immediate cells are within bounds and are floor and have not been visited before
                    } else {   /*      Obstacles colors      */
                        return !["#2d2d2d", "cyan", "#916242", "brown"].some(obstacle => grid[newX][newY].color === obstacle);
                    }
                });
                console.log(availableDirections)

                if (availableDirections.length === 0) {
                    availableDirections.push(directions[Math.floor(Math.random() * 4)]);
                }

                let available_pheromone = [];
                for (let i = 0; i < availableDirections.length; i++) {
                    const x = this.currentX + availableDirections[i].dx;
                    const y = this.currentY + availableDirections[i].dy;
                    if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
                        available_pheromone.push(grid[x][y].pheromone);
                    }
                }
                console.log("Pheromones available:", available_pheromone);
                console.log("Chosen path:", choosePath(available_pheromone));
                const move = availableDirections[choosePath(available_pheromone)];

                console.log("Moving to:", this.currentX + move.dx, "fromX", this.currentX, this.currentY + move.dy, "fromY", this.currentY);
                console.log(move, (this.visited.length + 1) / 40 + "% completed");

                // Move the ant to the new position
                this.currentX += move.dx;
                this.currentY += move.dy;

                if (grid[this.currentX][this.currentY].color === "#02b200") { alert("Se ha encontrado la salida"); break; }

                // Push the new position to the visited list
                this.visited.push({ x: this.currentX, y: this.currentY });

            } while (this.visited.length < 4000);
        }
    }


    function drawRoom() {
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
            const sectorX = 2.8 * table.margins.marginsector * sector + table.margins.marginsector * 0.5;
            for (let col = 0; col < table.sectors.cols; col++) {
                const tableX = sectorX + col * (table.width + table.margins.marginX);
                for (let row = 0; row < table.sectors.rows; row++) {
                    const tableY = 90 + row * (table.margins.marginY + table.height);
                    setColor([tableX, tableX + table.width], [tableY, tableY + table.height], table.color);
                }
            }
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
    function drawElements(x, y, visited) {
        drawRoom();
        if (x, y || visited) {
            if (x, y) {
                setColor([x - 2, x + 2], [y - 2, y + 2], "red");
            }
            if (visited) {
                for (let i = 0; i < visited.length; i++) {
                    setColor(visited[i].x, visited[i].y, "green")
                }
            }
        }
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
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
        color: "cyan",
        positions: [
            { x: 0, y: 30 },
            { x: 0, y: 160 },
            { x: 0, y: 290 }
        ]
    }
    const door = {
        color: "#02b200",
        x: gridWidth - 8,
        y: 310,
        width: 8,
        height: 60
    }
    const obstacles = {
        pillars: {
            color: "#2d2d2d",
            width: 12,
            height: 50,
            positions: [
                { x: 8, y: 110 },
                { x: 8, y: 240 },
                { x: gridWidth - 20, y: 120 },
                { x: gridWidth - 20, y: 164 },
                { x: gridWidth - 20, y: 212 },
                { x: gridWidth - 20, y: 250 }
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
                const ant = new Ant(cellX, cellY, alpha, heuristic, 1);
                console.log(`Ha pulsado en el punto (${ant.currentX}, ${ant.currentY})`);

                ant.move(grid);
                console.log(`La hormiga se ha desplazado al punto (${ant.currentX}, ${ant.currentY})`);
                drawElements(cellX, cellY, ant.visited);
                console.log(ant.visited)
                break;
            case "red":
                alert("Por favor, seleccione otra ubicación o pulse el botón de marcar el punto de partida")
                break;
            default:
                alert("No puedes empezar ahí. Haz clic en el suelo de la habitación");
                break;
        }
    });
    antsRange.addEventListener("change", function () {
        ants_value.textContent = antsRange.value
    });
    document.getElementById("reset").addEventListener("click", function () {
        location.reload();
    });
};
