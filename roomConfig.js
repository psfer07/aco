export const gridWidth = 180;
export const gridHeight = 200;
export const cellSize = 4;

export const room = {
    walls: {
        color: "#2d2d2d",
        horz: {
            width: gridWidth,
            height: cellSize,
            positions: [
                { x: 0, y: 0 },
                { x: 0, y: gridHeight - cellSize }
            ]
        },
        vert: {
            width: cellSize,
            height: gridHeight,
            positions: [
                { x: 0, y: 0 },
                { x: gridWidth - cellSize, y: 0 }
            ]
        }
    },
    windows: {
        width: cellSize,
        height: 9 * cellSize,
        color: "cyan",
        positions: [
            { x: 0, y: 3 * cellSize },
            { x: 0, y: 18 * cellSize },
            { x: 0, y: 33 * cellSize }
        ]
    },
    exit: {
        color: "#02b200",
        x: gridWidth - cellSize,
        y: gridHeight - 10 * cellSize,
        width: cellSize,
        height: 7 * cellSize
    },
    elements: {
        pillars: {
            color: "#2d2d2d",
            width: 2 * cellSize,
            height: 6 * cellSize,
            positions: [
                { x: cellSize, y: 12 * cellSize },
                { x: cellSize, y: 27 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 13 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 18 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 24 * cellSize },
                { x: gridWidth - 2 * cellSize, y: 29 * cellSize }
            ]
        },
        teacher_table: {
            color: "#916242",
            x: 4 * cellSize,
            y: 5 * cellSize,
            width: 15 * cellSize,
            height: 5 * cellSize
        },
        tables: {
            width: 4 * cellSize,
            height: 2 * cellSize,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                marginX: 2 * cellSize,
                marginY: 5 * cellSize,
                marginsector: 5 * cellSize
            }
        }
    }
};