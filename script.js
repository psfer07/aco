window.onload = function () {
    const canvas = document.getElementById("canvas_render");
    const paint = canvas.getContext("2d");
    const windowsCheckbox = document.getElementById("windows");
    const show_gridCheckbox = document.getElementById("show_grid");
    const show_obstaclesCheckbox = document.getElementById("show_obstacles");
    const cellSize = 8;
    const gridSize = 100;
    let HasSimStarted = false;
    let windowColor = "cyan";

    let grid = createGrid()
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;
    windowColor = "cyan"

    function createGrid() {
        const grid = [];
        const properties = {
            color: "#ccc"
        };
        for (let x = 0; x < gridSize; x++) {
            const cols = [];
            for (let y = 0; y < gridSize; y++) {
                cols.push({ ...properties });
            }
            grid.push(cols);
        }
        return grid;
    }
    function drawGrid() {
        paint.strokeStyle = "#aaa";
        paint.lineWidth = 0.3;
        paint.beginPath();
        for (let i = 0; i <= Math.max(canvas.width, canvas.height) - 0; i += cellSize) {
            paint.moveTo(0, i);
            paint.lineTo(canvas.width - 0, i);
            paint.moveTo(i, 0);
            paint.lineTo(i, canvas.height - 0);
        }
        paint.stroke();
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
    function drawElements() {
        paint.clearRect(0, 0, canvas.width, canvas.height);
        for (const wall of walls.horz.positions) {
            setColor([wall.x, wall.x + walls.horz.width - 1], [wall.y, wall.y + walls.horz.height - 1], walls.color);
        }
        for (const wall of walls.vert.positions) {
            setColor([wall.x, wall.x + walls.vert.width - 1], [wall.y, wall.y + walls.vert.height - 1], walls.color);
        }
        for (const window of windows.positions) {
            setColor([window.x, window.x + windows.width - 1], [window.y, window.y + windows.height - 1], windows.color);
        }
        setColor([door.x, door.x + door.width - 1], [door.y, door.y + door.height - 1], door.color);
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
        // Pillars
        for (const pillar of obstacles.pillars.positions) {
            setColor([pillar.x, pillar.x + obstacles.pillars.width - 1], [pillar.y, pillar.y + obstacles.pillars.height - 1], obstacles.pillars.color);
        }
        // Teacher's table
        const Ttable = obstacles.teacher_table
        setColor([Ttable.x, Ttable.x + Ttable.width - 1], [Ttable.y, Ttable.y + Ttable.height - 1], Ttable.color);
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                paint.fillStyle = grid[i][j].color;
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
        show_grid ? drawGrid() : false;
    }

    const walls = {
        color: "#2d2d2d",
        horz: {
            width: gridSize,
            height: gridSize * 0.02,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: gridSize * 0.98 }
            ]
        },
        vert: {
            width: gridSize * 0.02,
            height: gridSize,
            positions: [
                { x: 0, y: 0 },
                { x: gridSize * 0.98, y: 0 }
            ]
        },
    }
    const windows = {
        width: gridSize * 0.02,
        height: gridSize * 0.2,
        color: windowColor,
        positions: [
            { x: 0, y: gridSize * 0.1 },
            { x: 0, y: gridSize * 0.4 },
            { x: 0, y: gridSize * 0.7 }
        ]
    }
    const door = {
        color: "brown",
        x: gridSize * 0.98,
        y: gridSize * 0.85,
        width: gridSize * 0.02,
        height: gridSize * 0.1
    }
    const obstacles = {
        pillars: {
            color: "#2d2d2d",
            width: gridSize * 0.03,
            height: gridSize * 0.1,
            positions: [
                { x: gridSize * 0.02, y: gridSize * 0.3 },
                { x: gridSize * 0.02, y: gridSize * 0.6 },
                { x: gridSize * 0.95, y: gridSize * 0.3 },
                { x: gridSize * 0.95, y: gridSize * 0.4 },
                { x: gridSize * 0.95, y: gridSize * 0.5 },
                { x: gridSize * 0.95, y: gridSize * 0.6 }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: gridSize * 0.05,
            y: gridSize * 0.1,
            width: gridSize * 0.3,
            height: gridSize * 0.1
        },
        tables: {
            width: gridSize * 0.05,
            height: gridSize * 0.03,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                marginX: gridSize * 0.01,
                marginY: gridSize * 0.02,
                marginsector: gridSize * 0.1
            }
        }
    }
    drawElements();

    let prevRedDotX = null;
    let prevRedDotY = null;
    canvas.addEventListener("click", function (event) {
        if (HasSimStarted) { return; }
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const cellX = Math.floor(mouseX / cellSize);
        const cellY = Math.floor(mouseY / cellSize);

        switch (grid[cellX][cellY].color) {
            case "#ccc":
                console.log("Clicked coordinates: X =", mouseX, ", Y =", mouseY, " Coordenadas: (", cellX, ",", cellY, ")");

                if (prevRedDotX !== null && prevRedDotY !== null) {
                    setColor(prevRedDotX, prevRedDotY, "#ccc");
                }

                setColor(cellX, cellY, "red");
                drawElements();

                prevRedDotX = cellX;
                prevRedDotY = cellY;
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

    });
    show_gridCheckbox.addEventListener("change", function () {
        show_grid = !show_grid
        drawElements();
    });
    show_obstaclesCheckbox.addEventListener("change", function () {
        show_obstacles = !show_obstacles
        drawElements();
    });
    document.getElementById("start").addEventListener("click", function () {
        if (prevRedDotX, prevRedDotY != null) {
            HasSimStarted = true;
        } else { alert("Antes de empezar la simulación, selecciona un punto de partida") }
    });
    document.getElementById("reset").addEventListener("click", function () {
        location.reload();
    });
};
