import { applyTheme, setColor, runSimulations, drawElements } from './src/source.js';
const canvas = document.getElementById("canvas");
const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
const properties = { // Each cell will have these properties by default
    color: "#ccc",
    pheromone: 1.0
}
window.startingPoint = 'red';
window.cellSize = 1;
window.grid = [];
for (let x = 0; x < window.gridWidth; x++) {
    let cols = [];
    for (let y = 0; y < window.gridHeight; y++) { cols.push({ ...properties }); }
    window.grid.push(cols);
}
let start;

[canvas.width, canvas.height] = [window.gridWidth, window.gridHeight];
document.getElementById("widget_status").textContent = "Detenida";

applyTheme(darkThemeMq.matches);

window.onload = function () {
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
            setColor([start.x - 1, 2], [start.y - 1, 2], "#ff0101");
        } else {
            if (window.grid[start.x][start.y].color === startingPoint) {
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
