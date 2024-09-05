import { roundValues } from "./utils.js";

const canvas = document.getElementById("canvas");
export const gridWidth = 180;
export const gridHeight = 200;

export let room = roundValues({
    floor: {
        color: "#ccc",
        margin: gridWidth * 0.01,
        width: gridWidth * 0.99,
        height: gridHeight * 0.99
    },
    walls: {
        color: "#2d2d2d",
        horz: {
            width: gridWidth,
            height: gridHeight * 0.01,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: gridHeight * 0.99 }
            ]
        },
        vert: {
            width: gridWidth * 0.01,
            height: gridHeight,
            positions: [
                { x: 0, y: 0 },
                { x: gridWidth * 0.99, y: 0 }
            ]
        }
    },
    windows: {
        width: gridWidth * 0.01,
        height: gridHeight * 0.2,
        color: "cyan",
        positions: [
            { x: 0, y: gridHeight * 0.1 },
            { x: 0, y: gridHeight * 0.4 },
            { x: 0, y: gridHeight * 0.7 }
        ]
    },
    exit: {
        color: "#02b200",
        x: gridWidth * 0.99,
        y: gridHeight * 0.87,
        width: gridWidth * 0.01,
        height: gridHeight * 0.1
    },
    elements: {
        pillars: {
            color: "#2d2d2d",
            width: gridWidth * 0.02,
            height: gridHeight * 0.1,
            positions: [
                { x: gridWidth * 0.01, y: gridHeight * 0.3 },
                { x: gridWidth * 0.01, y: gridHeight * 0.6 },
                { x: gridWidth * 0.97, y: gridHeight * 0.3 },
                { x: gridWidth * 0.97, y: gridHeight * 0.4 },
                { x: gridWidth * 0.97, y: gridHeight * 0.5 },
                { x: gridWidth * 0.97, y: gridHeight * 0.6 }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: gridWidth * 0.05,
            y: gridWidth * 0.08,
            width: gridWidth * 0.25,
            height: gridWidth * 0.08
        },
        tables: {
            width: gridWidth * 0.1,
            height: gridWidth * 0.05,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                initialMarginX: gridWidth * 0.04,
                initialMarginY: gridWidth * 0.2425,
                marginX: gridWidth * 0.02,
                marginY: gridHeight * 0.1,
                sectorMargin: gridWidth * 0.35
            }
        }
    }
});