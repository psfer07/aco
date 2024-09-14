import { applyTheme, setColor, runSimulations, drawElements } from './src/source.js';
const canvasContainer = document.querySelector('.canvas-container');
const canvas = document.getElementById("canvas");
const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
const properties = { // Each cell will have these properties by default
    color: "#ccc",
    pheromone: 1.0
}
const containerRect = canvasContainer.getBoundingClientRect();
window.startingPoint = 'red';
window.cellSize = Math.floor(window.cellSize = Math.min(
    Math.floor(containerRect.width / window.gridWidth),
    Math.floor(containerRect.height / window.gridHeight)
));
window.grid = [];
for (let x = 0; x < window.gridWidth; x++) {
    let cols = [];
    for (let y = 0; y < window.gridHeight; y++) { cols.push({ ...properties }); }
    window.grid.push(cols);
}
let start;

document.getElementById("widget_status").textContent = "Detenida";

applyTheme(darkThemeMq.matches);

window.onload = function () {
    [canvas.width, canvas.height] = [window.gridWidth * window.cellSize, window.gridHeight * window.cellSize];
    drawElements();
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
                if (window.grid[i][j].color != "#ccc") {
                    state = false;
                    break;
                }
            }
        }
        if (state) {
            console.log(`Clicked at (${start.x}, ${start.y})`);
            drawElements();
            setColor([start.x - 1, 2], [start.y - 1, 2], window.startingPoint);
        } else {
            if (window.grid[start.x][start.y].color === window.startingPoint) {
                window.showToast("Por favor, seleccione otro punto o inicie la simulación.")
            } else { window.showToast("No puedes empezar ahí. Haz clic en el suelo de la habitación."); }
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
                window.showToast("Debe esperar a que la simulación actual termine o si no reinicie el simulador.")
            } else {
                window.showToast("Debe tener seleccionado un punto de partida antes de poder iniciar la simulación.");
            }
        }
    });
    window.addEventListener('resize', function () {
        const containerRect = canvasContainer.getBoundingClientRect();
        window.cellSize = Math.floor(window.cellSize = Math.min(
            Math.floor(containerRect.width / window.gridWidth),
            Math.floor(containerRect.height / window.gridHeight)
        ));
        [canvas.width, canvas.height] = [window.gridWidth * window.cellSize, window.gridHeight * window.cellSize];
        drawElements();
    });
};
