import { roundValues, drawElements } from "./source.js";
const canvas = document.getElementById("canvas");
const canvasContainer = document.querySelector('.canvas-container');
const containerRect = canvasContainer.getBoundingClientRect();

export const dimensions = {
    Class: {
        gridWidth: 180,
        gridHeight: 200
    },
    School: {
        gridWidth: 500,
        gridHeight: 200
    }
}

export const scenarios = roundValues({
    Class: {
        floor: {
            color: "#ccc",
            margin: dimensions.Class.gridWidth * 0.01,
            width: dimensions.Class.gridWidth * 0.99,
            height: dimensions.Class.gridHeight * 0.99
        },
        walls: {
            color: "#2d2d2d",
            horz: {
                width: dimensions.Class.gridWidth,
                height: dimensions.Class.gridHeight * 0.01,
                positions: [
                    { x: 0, y: 0 },
                    { x: 0, y: dimensions.Class.gridHeight * 0.99 }
                ]
            },
            vert: {
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight,
                positions: [
                    { x: 0, y: 0 },
                    { x: dimensions.Class.gridWidth * 0.99, y: 0 }
                ]
            }
        },
        windows: {
            width: dimensions.Class.gridWidth * 0.01,
            height: dimensions.Class.gridHeight * 0.2,
            color: "cyan",
            positions: [
                { x: 0, y: dimensions.Class.gridHeight * 0.1 },
                { x: 0, y: dimensions.Class.gridHeight * 0.4 },
                { x: 0, y: dimensions.Class.gridHeight * 0.7 }
            ]
        },
        exit: {
            color: "#02b200",
            x: dimensions.Class.gridWidth * 0.99,
            y: dimensions.Class.gridHeight * 0.87,
            width: dimensions.Class.gridWidth * 0.01,
            height: dimensions.Class.gridHeight * 0.1
        },
        elements: {
            pillars: {
                color: "#2d2d2d",
                width: dimensions.Class.gridWidth * 0.02,
                height: dimensions.Class.gridHeight * 0.1,
                positions: [
                    { x: dimensions.Class.gridWidth * 0.01, y: dimensions.Class.gridHeight * 0.3 },
                    { x: dimensions.Class.gridWidth * 0.01, y: dimensions.Class.gridHeight * 0.6 },
                    { x: dimensions.Class.gridWidth * 0.97, y: dimensions.Class.gridHeight * 0.3 },
                    { x: dimensions.Class.gridWidth * 0.97, y: dimensions.Class.gridHeight * 0.4 },
                    { x: dimensions.Class.gridWidth * 0.97, y: dimensions.Class.gridHeight * 0.5 },
                    { x: dimensions.Class.gridWidth * 0.97, y: dimensions.Class.gridHeight * 0.6 }
                ]
            },
            teacher_table: {
                color: "#916242",
                x: dimensions.Class.gridWidth * 0.05,
                y: dimensions.Class.gridWidth * 0.08,
                width: dimensions.Class.gridWidth * 0.25,
                height: dimensions.Class.gridWidth * 0.08
            },
            tables: {
                width: dimensions.Class.gridWidth * 0.1,
                height: dimensions.Class.gridWidth * 0.05,
                color: "brown",
                sectors: {
                    count: 3,
                    cols: 2,
                    rows: 5
                },
                margins: {
                    initialMarginX: dimensions.Class.gridWidth * 0.04,
                    initialMarginY: dimensions.Class.gridWidth * 0.2425,
                    marginX: dimensions.Class.gridWidth * 0.02,
                    marginY: dimensions.Class.gridHeight * 0.1,
                    sectorMargin: dimensions.Class.gridWidth * 0.35
                }
            }
        }
    },

    School: {
        floor: {
            color: "#ccc",
            margin: dimensions.School.gridWidth * 0.01,
            width: dimensions.School.gridWidth * 0.99,
            height: dimensions.School.gridHeight * 0.99
        },
        walls: {
            color: "#2d2d2d",
            horz: {
                width: dimensions.School.gridWidth,
                height: dimensions.School.gridHeight * 0.01,
                positions: [
                    { x: 0, y: 0 },
                    { x: 0, y: dimensions.School.gridHeight * 0.99 }
                ]
            },
            vert: {
                width: dimensions.School.gridWidth * 0.01,
                height: dimensions.School.gridHeight,
                positions: [
                    { x: 0, y: 0 },
                    { x: dimensions.School.gridWidth * 0.99, y: 0 }
                ]
            }
        }
    }
});

export function getSelectedScenario() { return document.querySelector('input[name="scenario"]:checked').value; }

document.getElementById('scenarios-form').addEventListener('change', () => {
    const selected = getSelectedScenario();
    [window.gridWidth, window.gridHeight] = [dimensions[selected].gridWidth, dimensions[selected].gridHeight];
    window.cellSize = Math.min(
        Math.floor(containerRect.width / window.gridWidth),
        Math.floor(containerRect.height / window.gridHeight)
    );
    if (window.cellSize == 0) window.cellSize++
    [canvas.width, canvas.height] = [window.gridWidth * window.cellSize, window.gridHeight * window.cellSize];
    console.log(window.gridWidth, window.gridHeight)
    drawElements(scenarios[selected]);
});

document.getElementById('scenarios-form').dispatchEvent(new Event('change'));
