export const gridWidth = 180;
export const gridHeight = 200;
export const cellSize = 4;

export const room = {
    floor: {
        color: "#ccc",
        margin: 2,
        width: gridWidth - 3,
        height: gridHeight - 3
    },
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
            x: cellSize * 4,
            y: cellSize * 5,
            width: cellSize * 15,
            height: cellSize * 5
        },
        tables: {
            width: cellSize * 4,
            height: cellSize * 2,
            color: "brown",
            sectors: {
                count: 3,
                cols: 2,
                rows: 5
            },
            margins: {
                initialMarginX: cellSize * 3,
                initialMarginY: cellSize * 12,
                marginX: cellSize * 2,
                marginY: cellSize * 5,
                sectorMargin: cellSize * 5,
                groupsMargin: cellSize * 0.7
            }
        }
    }
};