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
        gridHeight: 170
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
            0: {
                color: "#2d2d2d",
                width: dimensions.Class.gridWidth,
                height: dimensions.Class.gridHeight * 0.01,
                x: 0,
                y: 0
            },
            1: {
                color: "#2d2d2d",
                width: dimensions.Class.gridWidth,
                height: dimensions.Class.gridHeight * 0.01,
                x: 0,
                y: dimensions.Class.gridHeight * 0.99
            },
            2: {
                color: "#2d2d2d",
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight,
                x: 0,
                y: 0
            },
            3: {
                color: "#2d2d2d",
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight,
                x: dimensions.Class.gridWidth * 0.99,
                y: 0
            }
        },
        windows: {
            0: {
                color: "cyan",
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight * 0.2,
                x: 0,
                y: dimensions.Class.gridHeight * 0.1
            },
            1: {
                color: "cyan",
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight * 0.2,
                x: 0,
                y: dimensions.Class.gridHeight * 0.4
            },
            2: {
                color: "cyan",
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight * 0.2,
                x: 0,
                y: dimensions.Class.gridHeight * 0.7

            }
        },
        exits: {
            0: {
                color: "#9fb4ab",
                width: dimensions.Class.gridWidth * 0.01,
                height: dimensions.Class.gridHeight * 0.1,
                x: dimensions.Class.gridWidth * 0.99,
                y: dimensions.Class.gridHeight * 0.87
            }
        },
        elements: {
            pillars: {
                0: {
                    color: "#2d2d2d",
                    width: dimensions.Class.gridWidth * 0.02,
                    height: dimensions.Class.gridHeight * 0.1,
                    x: dimensions.Class.gridWidth * 0.01,
                    y: dimensions.Class.gridHeight * 0.3
                },
                1: {
                    color: "#2d2d2d",
                    width: dimensions.Class.gridWidth * 0.02,
                    height: dimensions.Class.gridHeight * 0.1,
                    x: dimensions.Class.gridWidth * 0.01,
                    y: dimensions.Class.gridHeight * 0.6
                },
                2: {
                    color: "#2d2d2d",
                    width: dimensions.Class.gridWidth * 0.02,
                    height: dimensions.Class.gridHeight * 0.4,
                    x: dimensions.Class.gridWidth * 0.97,
                    y: dimensions.Class.gridHeight * 0.3
                }
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
            0: {
                color: "#2d2d2d",
                width: dimensions.School.gridWidth,
                height: dimensions.School.gridHeight * 0.01,
                x: 0,
                y: 0
            },
            1: {
                color: "#2d2d2d",
                width: dimensions.School.gridWidth,
                height: dimensions.School.gridHeight * 0.01,
                x: 0,
                y: dimensions.School.gridHeight * 0.99
            },
            2: {
                color: "#2d2d2d",
                width: dimensions.School.gridWidth * 0.01 / 3,
                height: dimensions.School.gridHeight,
                x: 0,
                y: 0
            },
            3: {
                color: "#2d2d2d",
                width: dimensions.School.gridWidth * 0.01 / 3,
                height: dimensions.School.gridHeight,
                x: dimensions.School.gridWidth * (1 - 0.01 / 3),
                y: 0
            }
        },
        windows: {
            0: {
                color: "cyan",
                width: dimensions.School.gridWidth * 0.01 / 3,
                height: dimensions.School.gridHeight * 0.15,
                x: 0,
                y: dimensions.School.gridHeight * 0.425
            },
            1: {
                color: "cyan",
                width: dimensions.School.gridWidth * 0.01 / 3,
                height: dimensions.School.gridHeight * 0.15,
                x: dimensions.School.gridWidth * (1 - 0.01 / 3),
                y: dimensions.School.gridHeight * 0.425
            }
        },
        exits: {
            0: {
                color: "#9fb4ab",
                width: dimensions.School.gridWidth * 0.05,
                height: dimensions.School.gridHeight * 0.23,
                x: dimensions.School.gridWidth * 0.3,
                y: dimensions.School.gridHeight * 0.15
            },
            1: {
                color: "#9fb4ab",
                width: dimensions.School.gridWidth * 0.06,
                height: dimensions.School.gridHeight * 0.23,
                x: dimensions.School.gridWidth * 0.77,
                y: dimensions.School.gridHeight * 0.15
            },

            // Exit patches
            2: {
                color: "#9fb3ab",
                width: dimensions.School.gridWidth * 0.05,
                height: dimensions.School.gridHeight * 0.225,
                x: dimensions.School.gridWidth * 0.3,
                y: dimensions.School.gridHeight * 0.15
            },
            3: {
                color: "#9fb3ab",
                width: dimensions.School.gridWidth * 0.06,
                height: dimensions.School.gridHeight * 0.225,
                x: dimensions.School.gridWidth * 0.77,
                y: dimensions.School.gridHeight * 0.15
            }
        },
        elements: {
            classes: {
                top: {
                    class: {
                        // Class walls
                        left: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.002,
                            height: dimensions.School.gridHeight * 0.375,
                            x: 0,
                            y: 0
                        },
                        right: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.002,
                            height: dimensions.School.gridHeight * 0.375,
                            x: dimensions.School.gridWidth * 0.138,
                            y: 0
                        },
                        top: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.14,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: 0,
                            y: 0
                        },
                        bottom: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.14,
                            height: dimensions.School.gridHeight * 0.002,
                            x: 0,
                            y: dimensions.School.gridHeight * 0.375
                        },

                        // Class outer objects
                        o1: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.039,
                            height: dimensions.School.gridHeight * 0.04,
                            x: dimensions.School.gridWidth * 0.0275,
                            y: dimensions.School.gridHeight * 0.375
                        },
                        o2: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.04,
                            x: dimensions.School.gridWidth * 0.0925,
                            y: dimensions.School.gridHeight * 0.375
                        },

                        // Class windows
                        w1: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.005,
                            y: 0
                        },
                        w2: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.04,
                            y: 0
                        },
                        w3: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.074,
                            y: 0
                        },
                        w4: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.1075,
                            y: 0
                        },

                        // Class doors
                        d1: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.005,
                            y: dimensions.School.gridHeight * 0.375,
                        },
                        d2: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.07,
                            y: dimensions.School.gridHeight * 0.375,
                        },
                        d3: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.113,
                            y: dimensions.School.gridHeight * 0.375,
                        }
                    }
                },
                bottom: {
                    class: {
                        // Class walls
                        left: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.002,
                            height: dimensions.School.gridHeight * 0.375,
                            x: 0,
                            y: dimensions.School.gridHeight * 0.625
                        },
                        right: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.002,
                            height: dimensions.School.gridHeight * 0.375,
                            x: dimensions.School.gridWidth * 0.138,
                            y: dimensions.School.gridHeight * 0.625
                        },
                        top: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.14,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: 0,
                            y: dimensions.School.gridHeight * 0.625
                        },
                        bottom: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.14,
                            height: dimensions.School.gridHeight * 0.002,
                            x: 0,
                            y: dimensions.School.gridHeight * 0.625
                        },

                        // Class outer objects
                        o1: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.039,
                            height: dimensions.School.gridHeight * 0.04,
                            x: dimensions.School.gridWidth * 0.0275,
                            y: dimensions.School.gridHeight * 0.59
                        },
                        o2: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.04,
                            x: dimensions.School.gridWidth * 0.0925,
                            y: dimensions.School.gridHeight * 0.59
                        },

                        // Class windows
                        w1: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.005,
                            y: dimensions.School.gridHeight * 0.99
                        },
                        w2: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.04,
                            y: dimensions.School.gridHeight * 0.99
                        },
                        w3: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.074,
                            y: dimensions.School.gridHeight * 0.99
                        },
                        w4: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.025,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.1075,
                            y: dimensions.School.gridHeight * 0.99
                        },

                        // Class doors
                        d1: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.005,
                            y: dimensions.School.gridHeight * 0.625,
                        },
                        d2: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.07,
                            y: dimensions.School.gridHeight * 0.625,
                        },
                        d3: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.113,
                            y: dimensions.School.gridHeight * 0.625,
                        }
                    },
                    office: {
                        // Office walls
                        left: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.001,
                            height: dimensions.School.gridHeight * 0.18,
                            x: dimensions.School.gridWidth * 0.3,
                            y: dimensions.School.gridHeight * 0.84
                        },
                        right: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.001,
                            height: dimensions.School.gridHeight * 0.18,
                            x: dimensions.School.gridWidth * 0.408,
                            y: dimensions.School.gridHeight * 0.84
                        },
                        top: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.11,
                            height: dimensions.School.gridHeight * 0.003,
                            x: dimensions.School.gridWidth * 0.3,
                            y: dimensions.School.gridHeight * 0.83
                        },
                        center: {
                            color: "#2d2d2d",
                            width: dimensions.School.gridWidth * 0.001,
                            height: dimensions.School.gridHeight * 0.18,
                            x: dimensions.School.gridWidth * 0.354,
                            y: dimensions.School.gridHeight * 0.84
                        },

                        // Office window
                        w1: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.31,
                            y: dimensions.School.gridHeight * 0.99
                        },
                        w2: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.343,
                            y: dimensions.School.gridHeight * 0.99
                        },
                        w3: {
                            color: "cyan",
                            width: dimensions.School.gridWidth * 0.02,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.378,
                            y: dimensions.School.gridHeight * 0.99
                        },

                        // Office doors
                        d1: {
                            color: "#ccc",
                            width: dimensions.School.gridWidth * 0.0475,
                            height: dimensions.School.gridHeight * 0.0075,
                            x: dimensions.School.gridWidth * 0.33,
                            y: dimensions.School.gridHeight * 0.83
                        }
                    }
                }
            },
            pillars: {
                // Top
                0: {
                    color: "#2d2d2d",
                    width: dimensions.School.gridWidth * 0.02,
                    height: dimensions.School.gridHeight * 0.23,
                    x: dimensions.School.gridWidth * 0.28,
                    y: dimensions.School.gridHeight * 0.15
                },
                1: {
                    color: "#2d2d2d",
                    width: dimensions.School.gridWidth * 0.026,
                    height: dimensions.School.gridHeight * 0.23,
                    x: dimensions.School.gridWidth * 0.83,
                    y: dimensions.School.gridHeight * 0.15
                },
                2: {
                    color: "#2d2d2d",
                    width: dimensions.School.gridWidth * 0.068,
                    height: dimensions.School.gridHeight * 0.01,
                    x: dimensions.School.gridWidth * 0.282,
                    y: dimensions.School.gridHeight * 0.14
                },
                3: {
                    color: "#2d2d2d",
                    width: dimensions.School.gridWidth * 0.084,
                    height: dimensions.School.gridHeight * 0.01,
                    x: dimensions.School.gridWidth * 0.772,
                    y: dimensions.School.gridHeight * 0.14
                },
                // Bottom
                4: {
                    color: "#2d2d2d",
                    width: dimensions.School.gridWidth * 0.02,
                    height: dimensions.School.gridHeight * 0.365,
                    x: dimensions.School.gridWidth * 0.28,
                    y: dimensions.School.gridHeight * 0.625
                },
                5: {
                    color: "#2d2d2d",
                    width: dimensions.School.gridWidth * 0.026,
                    height: dimensions.School.gridHeight * 0.365,
                    x: dimensions.School.gridWidth * 0.83,
                    y: dimensions.School.gridHeight * 0.625
                },
            },
            spaces: {
                0: {
                    color: "#ccc",
                    width: dimensions.School.gridWidth * 0.068,
                    height: dimensions.School.gridHeight * 0.01,
                    x: dimensions.School.gridWidth * 0.282,
                    y: 0
                },
                1: {
                    color: "#ccc",
                    width: dimensions.School.gridWidth * 0.084,
                    height: dimensions.School.gridHeight * 0.01,
                    x: dimensions.School.gridWidth * 0.772,
                    y: 0
                }
            }
        }
    }
});

export function getSelectedScenario() { return document.querySelector('input[name="scenario"]:checked').value; }

document.getElementById('scenarios-form').addEventListener('change', () => {
    const selected = getSelectedScenario();
    if (selected == 'School') window.showToast("Este escenario se encuentra en mantenimiento, por lo que no podrás probarlo hasta que el desarrollador solucione el problema.");
    [window.gridWidth, window.gridHeight] = [dimensions[selected].gridWidth, dimensions[selected].gridHeight];

    // Cancel any running function instance
    window.isRunning = false

    // Reset matrix
    window.grid = [];
    for (let x = 0; x < window.gridWidth; x++) {
        let cols = [];
        for (let y = 0; y < window.gridHeight; y++) {
            cols.push({
                ...{ // Each cell will have these properties by default
                    color: "#ccc",
                    pheromone: 1.0
                }
            });
        }
        window.grid.push(cols);
    }

    // Reset labels
    document.getElementById('widget_status').textContent = 'Detenida'
    document.getElementById('widget_step').textContent = 'Esperando a la simulación...'
    document.getElementById('widget_distance').textContent = 'Esperando a la simulación...'
    document.getElementById('widget_visited').value = 'Esperando a la simulación...'
    
    // Set unitary scaling factor (USF)
    window.cellSize = Math.min(
        Math.floor(containerRect.width / window.gridWidth),
        Math.floor(containerRect.height / window.gridHeight)
    );
    if (window.cellSize == 0) window.cellSize++
    [canvas.width, canvas.height] = [window.gridWidth * window.cellSize, window.gridHeight * window.cellSize]; // Set canvas dimensions
    drawElements(scenarios[selected]);
});
document.getElementById('scenarios-form').dispatchEvent(new Event('change'));
