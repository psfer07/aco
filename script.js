window.onload = function () {
    const canvas = document.getElementById("aco_render");
    const paint = canvas.getContext("2d");
    let windowColor = "cyan";
    const cellSize = 6;
    const gridSize = 100;
    canvas.width = gridSize * cellSize;
    canvas.height = gridSize * cellSize;
    windowColor = "cyan"

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
    function drawSquare(x, y, color) {
        const startX = Array.isArray(x) ? x[0] : x;
        const endX = Array.isArray(x) ? x[1] : x;
        const startY = Array.isArray(y) ? y[0] : y;
        const endY = Array.isArray(y) ? y[1] : y;

        paint.fillStyle = color;
        for (let i = startX; i <= endX; i++) {
            for (let j = startY; j <= endY; j++) {
                paint.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    function drawElements() {
        for (const wall of walls.horz.positions) {
            drawSquare([wall.x, wall.x + walls.horz.width - 1], [wall.y, wall.y + walls.horz.height - 1], walls.color);
        }
        for (const wall of walls.vert.positions) {
            drawSquare([wall.x, wall.x + walls.vert.width - 1], [wall.y, wall.y + walls.vert.height - 1], walls.color);
        }
        for (const window of windows.positions) {
            drawSquare([window.x, window.x + windows.width - 1], [window.y, window.y + windows.height - 1], windows.color);
        }
        drawSquare([door.x, door.x + door.width - 1], [door.y, door.y + door.height - 1], door.color);
        drawGrid();
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

    let initial_points = [];
    drawElements();

    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        console.log("Clicked coordinates: X =", mouseX, ", Y =", mouseY);
        console.log(mouseY / cellSize, Math.floor(mouseY / cellSize));
        drawSquare(Math.floor(mouseX / cellSize), Math.floor(mouseY / cellSize), "red")
        let clickedElement = "";

        // Check if clicked on walls
        for (let wall of walls.horz.positions.concat(walls.vert.positions)) {
            if (mouseX >= wall.x && mouseX <= wall.x + wall.width &&
                mouseY >= wall.y && mouseY <= wall.y + wall.height) {
                clickedElement = "walls";
                break;
            }
        }

        // Check if clicked on door
        if (mouseX >= door.x && mouseX <= door.x + door.width &&
            mouseY >= door.y && mouseY <= door.y + door.height) {
            clickedElement = "door";
        }

        // Check if clicked on windows
        for (let window of windows.positions) {
            if (mouseX >= window.x && mouseX <= window.x + window.width &&
                mouseY >= window.y && mouseY <= window.y + window.height) {
                clickedElement = "windows";
                break;
            }
        }

        switch (clickedElement) {
            case "walls":
                console.log("Clicked on a wall.");
                break;
            case "door":
                console.log("Clicked on the door.");
                break;
            case "windows":
                console.log("Clicked on a window.");
                break;
            default:
                console.log("Clicked inside the room." + clickedElement);
                clickable = true;
                break;
        }

        drawElements();
    });

    console.log("Initial points array:", initial_points);

    const startButton = document.getElementById("start");

    startButton.addEventListener("click", function () {
        if (initial_points.length === 0) {
            console.log("The array is empty.");
        } else {
            console.log("The array is not empty.");
        }
    });


    document.getElementById("windows").addEventListener("change", function () {
        if (document.getElementById("windows").checked) {
            windowColor = windowColor === "cyan" ? "#1754c4" : "cyan";
            console.log("Updated")
            drawElements();
        }
    });

};
