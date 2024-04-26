window.onload = function () {
    const canvas = document.getElementById("aco_render");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");

    function module(x1, y1, x2, y2) {
        return parseFloat(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2).toFixed(4))
    }

    const room = {
        width: canvas.width,
        height: canvas.height,
        walls: {
            top: { x: 0, y: 0, width: canvas.width, height: canvas.height * 0.02 },
            right: { x: canvas.width * 0.98, y: canvas.height * 0.02, width: canvas.width * 0.02, height: canvas.height * 0.9 },
            bottom: { x: 0, y: canvas.height * 0.98, width: canvas.width, height: canvas.height * 0.02 },
            left: { x: 0, y: canvas.height * 0.02, width: canvas.width * 0.02, height: canvas.height * 0.96 }
        },
        door: { x: canvas.width * 0.98, y: canvas.height * 0.9, width: canvas.width * 0.02, height: canvas.height * 0.08 },
        windows: [
            { x: 0, y: canvas.height * 0.05, width: canvas.width * 0.02, height: canvas.height * 0.25 },
            { x: 0, y: canvas.height * 0.35, width: canvas.width * 0.02, height: canvas.height * 0.25 },
            { x: 0, y: canvas.height * 0.7, width: canvas.width * 0.02, height: canvas.height * 0.25 }
        ]
    };

    function drawRoom() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#2d2d2d";
        for (let wall of Object.values(room.walls)) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }

        ctx.fillStyle = "brown";
        ctx.fillRect(room.door.x, room.door.y, room.door.width, room.door.height);

        ctx.fillStyle = windowColor;
        for (let window of room.windows) {
            ctx.fillRect(window.x, window.y, window.width, window.height);
        }
    }

    let windowColor = "cyan";
    drawRoom();

    let initial_points = [];
    if (initial_points.length === 0) {
        console.log("The array is empty.");
    } else {
        console.log("The array is not empty.");
    }


    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        console.log("Clicked coordinates: X =", mouseX, ", Y =", mouseY);
        let clickedElement = "";

        for (let element of Object.entries(room)) {
            if (element[0] === "walls" || element[0] === "door" || element[0] === "windows") {
                for (let item of Object.values(element[1])) {
                    if (mouseX >= item.x && mouseX <= item.x + item.width && mouseY >= item.y && mouseY <= item.y + item.height) {
                        clickedElement = element[0];
                        break;
                    }
                }
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
                console.log("Clicked inside the room.");
                clickable = true
                break;
        }

        drawRoom();

        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
        ctx.fill();

        initial_points.push({ x: mouseX, y: mouseY });

        if (initial_points.length > 1) {
            initial_points.shift();
        }
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

    document.getElementById("btn_win").addEventListener("click", function () {
        windowColor = windowColor === "cyan" ? "#1754c4" : "cyan";
        drawRoom();
    });
}
