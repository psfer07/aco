window.onload = function () {
    const canvas = document.getElementById("aco_render");
    const paint = canvas.getContext("2d");
    const cellSize = 6;
    const gridSize = 100;
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
        paint.beginPath();
        for (let x = 0; x <= canvas.width; x += cellSize) {
            paint.moveTo(x, 0);
            paint.lineTo(x, canvas.height);
        }
        for (let y = 0; y <= canvas.height; y += cellSize) {
            paint.moveTo(0, y);
            paint.lineTo(canvas.width, y);
        }
        paint.stroke();
    }
    function changeCellColor(x, y, color) {
        const X = Array.isArray(x) ? x[0] : x;
        const endX = Array.isArray(x) ? x[1] : x;
        const Y = Array.isArray(y) ? y[0] : y;
        const endY = Array.isArray(y) ? y[1] : y;

        paint.fillStyle = color;
        for (let i = X; i <= endX; i++) {
            for (let j = Y; j <= endY; j++) {
                grid[i][j].color = color
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    function drawElements() {
        paint.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        for (const wall of walls.horz.positions) {
            changeCellColor([wall.x, wall.x + walls.horz.width - 1], [wall.y, wall.y + walls.horz.height - 1], walls.color);
        }
        for (const wall of walls.vert.positions) {
            changeCellColor([wall.x, wall.x + walls.vert.width - 1], [wall.y, wall.y + walls.vert.height - 1], walls.color);
        }
        for (const window of windows.positions) {
            changeCellColor([window.x, window.x + windows.width - 1], [window.y, window.y + windows.height - 1], windows.color);
        }
        changeCellColor([door.x, door.x + door.width - 1], [door.y, door.y + door.height - 1], door.color);
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

    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (grid[Math.floor(mouseX / cellSize)][Math.floor(mouseY / cellSize)].color === "#ccc") {
            console.log("Clicked coordinates: X =", mouseX, ", Y =", mouseY, " Coordenadas: (", Math.floor(mouseX / cellSize), ",", Math.floor(mouseY / cellSize), ")");
            console.log(Math.floor(mouseY / cellSize));
            drawElements();
            changeCellColor(Math.floor(mouseX / cellSize), Math.floor(mouseY / cellSize), "red")
        }
    });

    document.getElementById("windows").addEventListener("change", function () {
            windowColor = windowColor === "cyan" ? "#1754c4" : "cyan";
            windows.color = windowColor
            drawElements();
    });
};
