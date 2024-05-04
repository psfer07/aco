window.onload = function () {
    const canvas = document.getElementById("aco_render");
    const paint = canvas.getContext("2d");
    const cellSize = 6;
    const gridSize = 100;
    let windowColor = "cyan";
    let HasAcoStarted = false
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
        paint.beginPath();
        for (let x = 2 * cellSize; x <= canvas.width - 2 * cellSize; x += cellSize) {
            paint.moveTo(x, 2 * cellSize);
            paint.lineTo(x, canvas.height - 2 * cellSize);
        }
        for (let y = 2 * cellSize; y <= canvas.height - 2 * cellSize; y += cellSize) {
            paint.moveTo(2 * cellSize, y);
            paint.lineTo(canvas.width - 2 * cellSize, y);
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
        show_grid ? drawGrid() : false;
    }
    function start_aco(initialX, initialY) {
        console.log(initialX, initialY)
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
            { x: 0, y: gridSize * 0.42 },
            { x: 0, y: gridSize * 0.75 }
        ]
    }
    const door = {
        color: "brown",
        x: gridSize * 0.98,
        y: gridSize * 0.85,
        width: gridSize * 0.02,
        height: gridSize * 0.1
    }
    drawElements();
    let prevRedDotX = null;
    let prevRedDotY = null;
    canvas.addEventListener("click", function (event) {
        if (HasAcoStarted) { return; }
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
                alert("No puedes empezar ahí. Haz clic dentro de la habitación");
                break;
        }
    });
    document.getElementById("windows").addEventListener("change", function () {
        windowColor = windowColor === "cyan" ? "#1754c4" : "cyan";
        windows.color = windowColor
        drawElements();

    });
    document.getElementById("show_grid").addEventListener("change", function () {
        show_grid = !show_grid
        drawElements();
    });
    document.getElementById("start").addEventListener("click", function () {
        HasAcoStarted = true;
        start_aco(prevRedDotX, prevRedDotY);
    });
};
