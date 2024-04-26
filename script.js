window.onload = function () {
    // Obtener el canvas y su contexto
    const canvas = document.getElementById("aco_render");
    canvas.width = canvas.clientWidth; // Set canvas width to match CSS width
    canvas.height = canvas.clientHeight; // Set canvas height to match CSS height
    const ctx = canvas.getContext("2d");

    // Variable to store window color
    let windowColor = "cyan";

    function module(x1, y1, x2, y2){
        return parseFloat(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2).toFixed(4))
    }

    // Definir dimensiones y posiciones de los elementos
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

    // Function to draw room elements on the canvas
    function drawRoom() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw walls
        ctx.fillStyle = "#2d2d2d"; // Color for walls
        for (let wall of Object.values(room.walls)) {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }

        // Draw door
        ctx.fillStyle = "brown"; // Color for door
        ctx.fillRect(room.door.x, room.door.y, room.door.width, room.door.height);

        // Draw windows
        ctx.fillStyle = windowColor; // Dynamic color for windows
        for (let window of room.windows) {
            ctx.fillRect(window.x, window.y, window.width, window.height);
        }
    }

    // Initial draw of the room
    drawRoom();

    // Add event listener for clicking on the canvas
    canvas.addEventListener("click", function(event) {
        // Get mouse coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Display mouse coordinates in an alert
        alert("Coordenadas del ratón: X = " + mouseX + ", Y = " + mouseY + " hola " + module(0,0,mouseX,mouseY));
    });

    // Add event listener for clicking on the button to toggle window color
    document.getElementById("btn_win").addEventListener("click", function() {
        // Toggle window color between "cyan" and "#00264d"
        windowColor = windowColor === "cyan" ? "#1754c4" : "cyan";
        // Redraw the room with the new window color
        drawRoom();
    });
}
