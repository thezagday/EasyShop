import PF from 'pathfinding';

export class PathfindingService {
    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.grid = null;
        this.finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        });
    }

    initializeGrid(walkableAreas) {
        this.grid = new PF.Grid(this.gridWidth, this.gridHeight);

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid.setWalkableAt(x, y, false);
            }
        }

        walkableAreas.forEach(area => {
            for (let y = Math.floor(area.y); y < area.y + area.height; y++) {
                for (let x = Math.floor(area.x); x < area.x + area.width; x++) {
                    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                        this.grid.setWalkableAt(x, y, true);
                    }
                }
            }
        });
    }

    findPath(startPoint, endPoint) {
        if (!this.grid) {
            console.error('Grid not initialized');
            return null;
        }

        const gridCopy = this.grid.clone();
        
        const startX = Math.floor(startPoint[1]);
        const startY = Math.floor(startPoint[0]);
        const endX = Math.floor(endPoint[1]);
        const endY = Math.floor(endPoint[0]);

        if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
            console.warn('Start or end point is not walkable');
            return null;
        }

        const path = this.finder.findPath(startX, startY, endX, endY, gridCopy);
        
        if (path.length === 0) {
            return null;
        }

        return path.map(([x, y]) => [y, x]);
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
            return false;
        }
        return this.grid.isWalkableAt(x, y);
    }

    smoothPath(path, iterations = 2) {
        if (!path || path.length < 3) {
            return path;
        }

        let smoothedPath = [...path];
        
        for (let iter = 0; iter < iterations; iter++) {
            const tempPath = [smoothedPath[0]];
            
            for (let i = 1; i < smoothedPath.length - 1; i++) {
                const prev = smoothedPath[i - 1];
                const curr = smoothedPath[i];
                const next = smoothedPath[i + 1];
                
                const smoothY = (prev[0] + curr[0] + next[0]) / 3;
                const smoothX = (prev[1] + curr[1] + next[1]) / 3;
                
                tempPath.push([smoothY, smoothX]);
            }
            
            tempPath.push(smoothedPath[smoothedPath.length - 1]);
            smoothedPath = tempPath;
        }
        
        return smoothedPath;
    }

    calculateDistance(path) {
        if (!path || path.length < 2) {
            return 0;
        }

        let distance = 0;
        for (let i = 1; i < path.length; i++) {
            const dy = path[i][0] - path[i - 1][0];
            const dx = path[i][1] - path[i - 1][1];
            distance += Math.sqrt(dx * dx + dy * dy);
        }

        return Math.round(distance * 0.1);
    }
}
