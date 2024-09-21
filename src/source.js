import Ant from './ant.js'
import { scenarios, getSelectedScenario } from './layouts.js'
const canvas = document.getElementById("canvas");
const paint = canvas.getContext("2d");
const [startingAnt, returningAnt] = ["green", "darkgreen"];
let stepNumber = 0;

function getObjects(object) {
    let objects = [];
    if (Array.isArray(object)) {
        for (let i = 0; i < window.gridWidth; i++) {
            for (let j = 0; j < window.gridHeight; j++) {
                if (object.some(object => window.grid[i][j].color === object)) objects.push({ x: i, y: j });
            }
        }
    } else {
        for (let i = 0; i < window.gridWidth; i++) {
            for (let j = 0; j < window.gridHeight; j++) {
                if (window.grid[i][j].color === object) objects.push({ x: i, y: j });
            }
        }
    }
    return objects;
}
async function antStart(state, start, initial, alpha, beta, rho, deposit, objects) {
    return new Promise((resolve, reject) => {
        const room = scenarios[getSelectedScenario()];
        let moveCount = 0;
        let distanceCumulative = 0;
        let { x, y } = initial;
        let visited = [{ x, y }];
        let deadEnds = [];
        let ant = new Ant(x, y, visited, objects, state ? Math.pow(alpha, 2) : alpha, beta, deposit, window.gridWidth, window.gridHeight);

        function moveAnt() {
            function getNearestPoint(x0, y0, objects) {
                let nearest = {};
                let currentDistance = Infinity;

                for (const object of objects) {
                    const distance = Math.sqrt(Math.pow(object.x - x0, 2) + Math.pow(object.y - y0, 2));
                    if (distance < currentDistance) {
                        nearest = { x: object.x, y: object.y };
                        currentDistance = distance;
                    } else {
                        break;
                    }
                }
                return nearest;
            }

            try {
                let dirs = ant.getDirs(x, y);
                if (dirs.length === 0) {
                    let newdirs = [];
                    do {
                        let revert = ant.revertMove();
                        deadEnds.push(revert.avoid);
                        [x, y] = [revert.x, revert.y];
                        newdirs = ant.getDirs(x, y, deadEnds);
                    } while (newdirs.length < 1);
                    ant.x = x;
                    ant.y = y;
                    dirs = newdirs;
                }
                let exits = [];
                for (const key in room.exits) {
                    const exit = room.exits[key];
                    exits.push(exit.color);
                }
                let nearestPoint = getNearestPoint(x, y, getObjects(state ? exits : window.startingPoint));
                const [movedTo, distance] = ant.move(window.grid, dirs, nearestPoint);
                moveCount++;
                visited.push({ x: movedTo.x, y: movedTo.y });

                // Evaporate pheromone
                for (const visit of visited) {
                    window.grid[visit.x][visit.y].pheromone *= (1 - rho);
                    if (window.grid[visit.x][visit.y].pheromone < 0.00001) window.grid[visit.x][visit.y].pheromone = 0;
                }

                [x, y] = [movedTo.x, movedTo.y];
                ant.x = movedTo.x;
                ant.y = movedTo.y;
                distanceCumulative += distance;

                // Loop exit
                if (ant.checkExit(window.grid, state)) { resolve([{ x, y }, distanceCumulative, visited]); return; }

                // Update canvas
                for (const visit of visited) setColor(visit.x, visit.y, state ? startingAnt : returningAnt);
                setColor([start.x - 1, 2], [start.y - 1, 2], window.startingPoint);

                // Speed regulation
                if (moveCount % Number(document.getElementById("ant_speed").value) === 0 &&
                    Number(document.getElementById("ant_speed").value) != Number(document.getElementById("ant_speed").max)) requestAnimationFrame(moveAnt);
                else moveAnt(); // Continue the loop
            } catch (error) {
                console.log("Error during ant movement:", error);
                reject(error);
            }
        }
        requestAnimationFrame(moveAnt); // Start the loop
    });
}
export async function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        document.getElementById('theme-icon').src = './src/dark.svg';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-icon').src = './src/light.svg';
        localStorage.setItem('theme', 'light');
    }
    window.applyTheme = applyTheme;
}
export async function setColor(x, y, color) {
    const X = Array.isArray(x) ? x[0] : x;
    const endX = Array.isArray(x) ? x[0] + x[1] : x;
    const Y = Array.isArray(y) ? y[0] : y;
    const endY = Array.isArray(y) ? y[0] + y[1] : y;
    for (let i = X; i <= endX; i++) {
        for (let j = Y; j <= endY; j++) {
            try {
                window.grid[i][j].color = color;
                paint.fillStyle = window.grid[i][j].color;
                paint.fillRect(i * window.cellSize, j * window.cellSize, window.cellSize, window.cellSize);
            } catch (error) {
                return;
            }
        }
    }
}
export async function drawElements(room) {
    const { floor, walls, windows, exits, elements } = room;
    for (const item in room) {
        switch (item) {
            case 'floor':
                setColor([floor.margin, floor.width - floor.margin], [floor.margin, floor.height - floor.margin], floor.color);
                break;
            case 'walls':
                for (const key in walls) { const wall = walls[key]; setColor([wall.x, wall.width - 1], [wall.y, wall.height - 1], wall.color); }
                break;
            case 'windows':
                for (const key in windows) { const window = windows[key]; setColor([window.x, window.width - 1], [window.y, window.height - 1], window.color); }
                break;
            case 'exits':
                for (const key in exits) { const exit = exits[key]; setColor([exit.x, exit.width - 1], [exit.y, exit.height - 1], exit.color); }
                break;
            case 'elements':
                for (const key in elements) {
                    switch (key) {
                        case 'pillars':
                            const pillars = elements.pillars;
                            for (const key in pillars) { const pillar = pillars[key]; setColor([pillar.x, pillar.width - 1], [pillar.y, pillar.height - 1], pillar.color); }
                            break;
                        case 'teacher_table':
                            const Ttable = elements.teacher_table;
                            setColor([Ttable.x, Ttable.width - 1], [Ttable.y, Ttable.height - 1], Ttable.color);
                            break;
                        case 'tables':
                            const table = elements.tables;
                            for (let i = 0; i < table.sectors.count; i++) {
                                const sectorX = table.margins.sectorMargin * i + table.margins.initialMarginX;
                                for (let col = 0; col < table.sectors.cols; col++) {
                                    const tableX = sectorX + col * (table.width + table.margins.marginX);
                                    for (let row = 0; row < table.sectors.rows; row++) {
                                        const tableY = row * (table.margins.marginY + table.height) + table.margins.initialMarginY;
                                        setColor([tableX, table.width], [tableY, table.height], table.color);
                                    }
                                }
                            }
                            break;
                        case 'classes':
                            const classes = elements.classes;
                            for (const key in classes) {
                                const Class = classes[key];
                                const count = Class.count;
                                for (let i = 0; i < count; i++) {
                                    for (const subKey in Class) {
                                        const position = Class[subKey];
                                        for (const classKey in position) {
                                            const object = position[classKey];
                                            setColor([object.x, object.width], [object.y, object.height], object.color);
                                        }
                                    }
                                }
                            }
                            break;
                        default:
                            console.warn(`The element '${key}' is not currently supported by the simulator. See the layouts.js file for structure information.`);
                    }
                }
                break;
            default:
                console.warn(`The item '${item}' is not currently supported by the simulator. See the layouts.js file for structure information.`);
                break;
        }
    }
}
export async function runSimulations(start, alpha, beta, rho, deposit, steps) {
    const room = scenarios[getSelectedScenario()];
    let currentPoint = start;
    let [oldDistance, newDistance] = [0, Infinity];
    let elements = [];
    let visited = [];
    let bestPath = [];
    document.getElementById("widget_status").textContent = "En ejecucción";

    // Reset trace through simulations
    for (let i = 0; i < window.gridWidth; i++) {
        for (let j = 0; j < window.gridHeight; j++) {
            if (window.grid[i][j].pheromone != 1.0) window.grid[i][j].pheromone = 1.0;
        }
    }

    for (stepNumber = 0; stepNumber < steps; stepNumber++) {
        try {
            let stringPath = '';
            let objects = [];

            for (const key in room) {
                const element = room[key];
                if (key === 'walls' || key === 'windows' || key === 'elements') {
                    for (const subKey in element) {
                        const subElement = element[subKey];
                        if (subElement.color) objects.push(subElement.color);
                        if (typeof subElement === 'object' && !subElement.color) {
                            for (const part in subElement) {
                                if (subElement[part].color) objects.push(subElement[part].color);
                            }
                        }
                    }
                }
            }
            drawElements(scenarios[getSelectedScenario()]);
            for (const path of bestPath) { setColor(path.x, path.y, startingAnt) };
            document.getElementById("widget_step").textContent = `${stepNumber + 1} de ${steps}`;

            elements = getObjects(objects);
            [currentPoint, newDistance, visited] = await antStart(1, start, currentPoint, alpha, beta, rho, deposit, elements);
            if (newDistance < oldDistance || oldDistance == 0) {
                oldDistance = newDistance;
                bestPath = visited;
            }
            for (const path of bestPath) setColor(path.x, path.y, startingAnt);
            visited = [];
            elements = [];
            for (const key in room.exits) {
                const exit = room.exits[key];
                objects.push(exit.color); // Added all exits as objects for the ant to avoid
            }

            elements = getObjects(objects);
            [currentPoint, newDistance, visited] = await antStart(0, start, currentPoint, alpha, beta, rho, deposit, elements);
            if (newDistance < oldDistance) {
                oldDistance = newDistance;
                bestPath = visited;
            }

            visited = [];
            elements = [];
            for (const path of bestPath) {
                setColor(path.x, path.y, window.startingPoint);
                stringPath += `(${path.x}, ${path.y}), `;
            }
            stringPath = stringPath.substring(0, stringPath.length - 2); // Remove the last comma and space
            document.getElementById("widget_visited").value = stringPath
            document.getElementById("widget_distance").textContent = oldDistance;

        } catch (error) {
            window.showToast("Ha ocurrido un error. Puede ver más detalles en la consola.")
            console.log("Error in simulation:", error.message);
            document.getElementById("widget_status").textContent = "Detenida"
            return;
        }
    }
    document.getElementById("widget_status").textContent = "Detenida"
    drawElements(scenarios[getSelectedScenario()]);
    for (const path of bestPath) setColor(path.x, path.y, window.startingPoint);
}
export function roundValues(obj) {
    if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
            return obj.map(item => roundValues(item));
        } else {
            let roundedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    roundedObj[key] = roundValues(obj[key]);
                }
            }
            return roundedObj;
        }
    } else if (typeof obj === 'number') {
        return Math.round(obj);
    }
    return obj;
}
window.showToast = async function (t) {
    const toast = document.getElementById('toast');
    toast.textContent = t;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
};