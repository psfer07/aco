import { roundValues } from "./source.js";
window.gridWidth = 180;
window.gridHeight = 200;

export default roundValues({
    floor: {
        color: "#ccc",
        margin: window.gridWidth * 0.01,
        width: window.gridWidth * 0.99,
        height: window.gridHeight * 0.99
    },
    walls: {
        color: "#2d2d2d",
        horz: {
            width: window.gridWidth,
            height: window.gridHeight * 0.01,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: window.gridHeight * 0.99 }
            ]
        },
        vert: {
            width: window.gridWidth * 0.01,
            height: window.gridHeight,
            positions: [
                { x: 0, y: 0 },
                { x: window.gridWidth * 0.99, y: 0 }
            ]
        }
    },
    windows: {
        width: window.gridWidth * 0.01,
        height: window.gridHeight * 0.2,
        color: "cyan",
        positions: [
            { x: 0, y: window.gridHeight * 0.1 },
            { x: 0, y: window.gridHeight * 0.4 },
            { x: 0, y: window.gridHeight * 0.7 }
        ]
    },
    exit: {
        color: "#02b200",
        x: window.gridWidth * 0.99,
        y: window.gridHeight * 0.87,
        width: window.gridWidth * 0.01,
        height: window.gridHeight * 0.1
    },
    elements: {
        pillars: {
            color: "#2d2d2d",
            width: window.gridWidth * 0.02,
            height: window.gridHeight * 0.1,
            positions: [
                { x: window.gridWidth * 0.01, y: window.gridHeight * 0.3 },
                { x: window.gridWidth * 0.01, y: window.gridHeight * 0.6 },
                { x: window.gridWidth * 0.97, y: window.gridHeight * 0.3 },
                { x: window.gridWidth * 0.97, y: window.gridHeight * 0.4 },
                { x: window.gridWidth * 0.97, y: window.gridHeight * 0.5 },
                { x: window.gridWidth * 0.97, y: window.gridHeight * 0.6 }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: window.gridWidth * 0.05,
            y: window.gridWidth * 0.08,
            width: window.gridWidth * 0.25,
            height: window.gridWidth * 0.08
        },
        tables: {
            width: window.gridWidth * 0.1,
            height: window.gridWidth * 0.05,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                initialMarginX: window.gridWidth * 0.04,
                initialMarginY: window.gridWidth * 0.2425,
                marginX: window.gridWidth * 0.02,
                marginY: window.gridHeight * 0.1,
                sectorMargin: window.gridWidth * 0.35
            }
        }
    }
});