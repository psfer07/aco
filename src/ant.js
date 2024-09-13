export default class Ant {
    constructor(x, y, visited, obstacle, alpha, beta, deposit, gridWidth, gridHeight) {
        this.x = x;
        this.y = y;
        this.visited = visited;
        this.obstacle = obstacle;
        this.alpha = alpha;
        this.beta = beta;
        this.deposit = deposit;
        this.godQuotient = (gridWidth < gridHeight ? gridHeight : gridWidth) / (gridWidth > gridHeight ? gridHeight : gridWidth); // The longer by the shorter
        this.directions = [  // Directions are set clockwise
            { x: 0, y: -1 }, // Up
            { x: 1, y: -1 }, // Up-right
            { x: 1, y: 0 },  // Right
            { x: 1, y: 1 },  // Down-right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 1 }, // Down-left
            { x: -1, y: 0 }, // Left
            { x: -1, y: -1 } // Up-left
        ];
    }
    _calcCost(pheromone, directions, goal) {
        function calcProbabilities(weighs) {
            let sum = 0;
            for (let i = 0; i < weighs.length; i++) { sum += weighs[i]; }
            const probabilities = [];
            for (let i = 0; i < weighs.length; i++) { probabilities[i] = weighs[i] / sum; }
            return probabilities; // Current case by all possible cases
        }
        function moduleToGoal(x, y) {
            const distance = Math.sqrt(Math.pow(goal.x - x, 2) + Math.pow(goal.y - y, 2)); // Euclidean formula
            return distance;
        }

        let weighs = [];
        let distance = Infinity;
        let bestDirectionIndex = 0;

        for (let i = 0; i < directions.length; i++) {
            const euclideanDistance = moduleToGoal(this.x + directions[i].x, this.y + directions[i].y);
            const invertedDistance = (Math.abs(directions[i].x) + Math.abs(directions[i].y)) === 2 ? 1 / Math.sqrt(2) : 1;
            let weigh = Math.pow(pheromone[i], this.alpha) * Math.pow(invertedDistance, this.beta); // Generic cost calculation formula for Ant Colony Optimization systems

            weighs.push(weigh);

            if (euclideanDistance < distance) {
                distance = euclideanDistance;
                bestDirectionIndex = i;
            }
        }

        weighs[bestDirectionIndex] += this.godQuotient; // Algorithm improvement aside the original ACO algorithm

        const lastVisitedCellIndex = this.directions.findIndex(direction =>
            this.visited[this.visited.length - 1].x === this.x - direction.x &&
            this.visited[this.visited.length - 1].y === this.y - direction.y
        );
        if (lastVisitedCellIndex > 0) weighs[lastVisitedCellIndex - 1] /= 3;
        if (lastVisitedCellIndex < 0) weighs[lastVisitedCellIndex + 1] /= 3;


        const probabilities = calcProbabilities(weighs);
        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i];
            if (rand < cumulative) {
                return i;
            }
        }
    }
    getDirs(x, y, avoid) {
        if (!(x && y)) {
            x = this.x;
            y = this.y;
        }
        return this.directions.filter(direction => {
            const newX = x + direction.x;
            const newY = y + direction.y;
            const isObject = this.obstacle.some(object => newX === object.x && newY === object.y);
            const isVisited = this.visited.some(visit => newX === visit.x && newY === visit.y);
            const isAvoided = avoid && avoid.some(deadEnd => deadEnd.x === newX && deadEnd.y === newY);

            return !isObject && !isVisited && !isAvoided;
        });
    }
    move(grid, directions, goal) {
        const total_pheromone = directions.map(direction => {
            const inX = this.x + direction.x;
            const inY = this.y + direction.y;
            return grid[inX][inY].pheromone;
        });

        const index = this._calcCost(total_pheromone, directions, goal);
        const newX = this.x + directions[index].x;
        const newY = this.y + directions[index].y;
        grid[newX][newY].pheromone += this.deposit;

        // Update ant's position and visited path
        this.x = newX;
        this.y = newY;
        const distance = (Math.abs(directions[index].x) + Math.abs(directions[index].y)) === 2 ? Math.sqrt(2) : 1;
        return [{ x: newX, y: newY }, distance];
    }
    revertMove() {
        const deadEnd = this.visited.pop(); // Remove from visited the last element
        const { x, y } = this.visited[this.visited.length - 1]; // Get the new last element
        return { x: x, y: y, avoid: deadEnd };
    }
    checkExit(grid, state) {
        const color = state ? "#02b200" : "red";
        let isExit = false;
        for (const direction of this.directions) {
            const exitX = this.x + direction.x;
            const exitY = this.y + direction.y;
            if (grid[exitX][exitY].color === color) {
                isExit = true;
                break;
            }
        }
        return isExit;
    }
}