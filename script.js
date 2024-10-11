import { applyTheme, setColor, runSimulations, drawElements } from './src/source.js';
import { dimensions, scenarios, getSelectedScenario } from './src/layouts.js'
const canvasContainer = document.querySelector('.canvas-container');
const canvas = document.getElementById("canvas");
const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
const properties = { // Each cell will have these properties by default
    color: "#ccc",
    pheromone: 1.0
}
window.startingPoint = 'red'; // Global color for the starting point
window.grid = [];
for (let x = 0; x < window.gridWidth; x++) {
    let cols = [];
    for (let y = 0; y < window.gridHeight; y++) { cols.push({ ...properties }); }
    window.grid.push(cols);
}
let start;

document.getElementById("widget_status").textContent = "Detenida";

// Load last used theme if available
if (localStorage.getItem('theme')) { localStorage.getItem('theme') == 'dark' ? applyTheme(1) : applyTheme(); } else { applyTheme(darkThemeMq.matches); }

window.onload = function () {
    drawElements(scenarios[getSelectedScenario()]) // Initial drawing
    darkThemeMq.addEventListener("change", e => {
        applyTheme(e.matches);
        localStorage.setItem('theme', e.matches ? 'dark' : 'light');
    });
    
    canvas.addEventListener("click", function (event) {
        const rect = canvas.getBoundingClientRect();
        let clickedOnFloor = true;
        start = {
            x: Math.floor((event.clientX - rect.left) / window.cellSize),
            y: Math.floor((event.clientY - rect.top) / window.cellSize)
        };
        document.getElementById("widget_status").textContent = "Detenida";
        for (let i = start.x - 1; i <= start.x + 1; i++) {
            for (let j = start.y - 1; j <= start.y + 1; j++) {
                if (window.grid[i][j].color != "#ccc") {
                    clickedOnFloor = false;
                    break;
                }
            }
        }
        // If clicked on a valid position
        if (clickedOnFloor) {
            console.log(`Clicked at (${start.x}, ${start.y})`);
            drawElements(scenarios[getSelectedScenario()]);
            setColor([start.x - 1, 2], [start.y - 1, 2], window.startingPoint);
        } else {

            // If clicked on the current starting point
            if (window.grid[start.x][start.y].color === window.startingPoint) {
                window.showToast("Por favor, seleccione otro punto o inicie la simulación.")
            } else { window.showToast("No puedes empezar ahí. Haz clic en el suelo de la habitación."); } // If clicked elsewhere
        }
    });
    document.getElementById("start").addEventListener("click", function () {

        // If there is any point set and the simulation is down
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
        const selected = getSelectedScenario();
        [window.gridWidth, window.gridHeight] = [dimensions[selected].gridWidth, dimensions[selected].gridHeight];

        // Set unitary scaling factor (USF)
        window.cellSize = Math.min(
            Math.floor(containerRect.width / window.gridWidth),
            Math.floor(containerRect.height / window.gridHeight)
        );
        if (window.cellSize == 0) window.cellSize++
        [canvas.width, canvas.height] = [window.gridWidth * window.cellSize, window.gridHeight * window.cellSize];
        drawElements(scenarios[getSelectedScenario()]);
    });
};
