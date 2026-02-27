import { PathfindingService } from '../Map/MapImage/PathfindingService';
import { SCALE, MAP_WIDTH, MAP_HEIGHT, HALF_W, HALF_H } from './constants';

const ROUTE_Y = 0.08; // Route floats slightly above floor

function adminToThreeRoute(x, y) {
    return [
        x * SCALE - HALF_W,
        ROUTE_Y,
        y * SCALE - HALF_H
    ];
}

export class RouteBuilder3D {
    constructor() {
        this.obstacles = [];
        this.pathfinding = null;
        this.gridCellSize = 10;
        this.gridWidth = 0;
        this.gridHeight = 0;
    }

    setObstacles(obstacles) {
        this.obstacles = obstacles;
        this.initializePathfinding();
    }

    initializePathfinding() {
        this.gridWidth = Math.ceil(MAP_WIDTH / this.gridCellSize);
        this.gridHeight = Math.ceil(MAP_HEIGHT / this.gridCellSize);

        this.pathfinding = new PathfindingService(this.gridWidth, this.gridHeight);

        // Entire map is walkable
        this.pathfinding.initializeGrid([{
            x: 0, y: 0,
            width: this.gridWidth,
            height: this.gridHeight
        }]);

        // Mark obstacles as non-walkable (exact bounds, no padding to preserve narrow corridors)
        this.obstacles.forEach(obs => {
            const gx = Math.floor(obs.x / this.gridCellSize);
            const gy = Math.floor(obs.y / this.gridCellSize);
            const gw = Math.ceil(obs.width / this.gridCellSize);
            const gh = Math.ceil(obs.height / this.gridCellSize);

            for (let y = gy; y < gy + gh; y++) {
                for (let x = gx; x < gx + gw; x++) {
                    if (this.pathfinding.grid &&
                        x >= 0 && x < this.gridWidth &&
                        y >= 0 && y < this.gridHeight) {
                        this.pathfinding.grid.setWalkableAt(x, y, false);
                    }
                }
            }
        });

        console.log('3D Pathfinding initialized:', this.gridWidth, 'x', this.gridHeight, 'obstacles:', this.obstacles.length);
    }

    centerPathInCorridors(pathYX) {
        if (!pathYX || pathYX.length < 3) return pathYX;
        if (!this.pathfinding.grid) return pathYX;

        const MAX_SCAN = 15;
        const grid = this.pathfinding.grid;
        const result = [pathYX[0]];

        for (let i = 1; i < pathYX.length - 1; i++) {
            const [y, x] = pathYX[i];
            const [py, px] = pathYX[i - 1];
            const [ny, nx] = pathYX[i + 1];
            const dx = nx - px;
            const dy = ny - py;
            const prevStepX = x - px;
            const prevStepY = y - py;
            const nextStepX = nx - x;
            const nextStepY = ny - y;

            const hasTurn =
                (prevStepX !== 0 && nextStepX !== 0 && Math.sign(prevStepX) !== Math.sign(nextStepX)) ||
                (prevStepY !== 0 && nextStepY !== 0 && Math.sign(prevStepY) !== Math.sign(nextStepY));

            let newX = x, newY = y;
            const isMostlyHorizontal = Math.abs(dx) > Math.abs(dy);
            const isMostlyVertical = Math.abs(dy) > Math.abs(dx);

            // If moving mostly horizontally, center vertically
            if (!hasTurn && isMostlyHorizontal) {
                let dUp = MAX_SCAN, dDown = MAX_SCAN;
                for (let d = 1; d <= MAX_SCAN; d++) {
                    if (dUp === MAX_SCAN && (y - d < 0 || !grid.isWalkableAt(x, y - d))) dUp = d;
                    if (dDown === MAX_SCAN && (y + d >= this.gridHeight || !grid.isWalkableAt(x, y + d))) dDown = d;
                }
                if (dUp < MAX_SCAN && dDown < MAX_SCAN) {
                    newY = y + Math.round((dDown - dUp) / 2);
                }
            }

            // If moving mostly vertically, center horizontally
            else if (!hasTurn && isMostlyVertical) {
                let dLeft = MAX_SCAN, dRight = MAX_SCAN;
                for (let d = 1; d <= MAX_SCAN; d++) {
                    if (dLeft === MAX_SCAN && (x - d < 0 || !grid.isWalkableAt(x - d, y))) dLeft = d;
                    if (dRight === MAX_SCAN && (x + d >= this.gridWidth || !grid.isWalkableAt(x + d, y))) dRight = d;
                }
                if (dLeft < MAX_SCAN && dRight < MAX_SCAN) {
                    newX = x + Math.round((dRight - dLeft) / 2);
                }
            }

            if (newX >= 0 && newX < this.gridWidth && newY >= 0 && newY < this.gridHeight &&
                grid.isWalkableAt(newX, newY)) {
                result.push([newY, newX]);
            } else {
                result.push([y, x]);
            }
        }

        result.push(pathYX[pathYX.length - 1]);
        return result;
    }

    deJitterCenteredPath(pathYX) {
        if (!pathYX || pathYX.length < 3) return pathYX;
        const grid = this.pathfinding?.grid;
        const result = pathYX.map(([y, x]) => [y, x]);

        for (let i = 1; i < result.length - 1; i++) {
            const [py, px] = result[i - 1];
            const [y, x] = result[i];
            const [ny, nx] = result[i + 1];

            const forwardX = (x - px) * (nx - x) > 0;
            const forwardY = (y - py) * (ny - y) > 0;

            // Remove one-cell vertical wobble on a horizontal run.
            if (py === ny && y !== py && forwardX) {
                if (!grid || grid.isWalkableAt(x, py)) {
                    result[i] = [py, x];
                    continue;
                }
            }

            // Remove one-cell horizontal wobble on a vertical run.
            if (px === nx && x !== px && forwardY) {
                if (!grid || grid.isWalkableAt(px, y)) {
                    result[i] = [y, px];
                }
            }
        }

        return result;
    }

    simplifyPath(pathYX) {
        if (!pathYX || pathYX.length < 3) return pathYX;

        const simplified = [pathYX[0]];
        for (let i = 1; i < pathYX.length - 1; i++) {
            const [py, px] = simplified[simplified.length - 1];
            const [y, x] = pathYX[i];
            const [ny, nx] = pathYX[i + 1];

            const dir1Y = Math.sign(y - py);
            const dir1X = Math.sign(x - px);
            const dir2Y = Math.sign(ny - y);
            const dir2X = Math.sign(nx - x);

            if (dir1Y === dir2Y && dir1X === dir2X) continue;
            simplified.push(pathYX[i]);
        }

        simplified.push(pathYX[pathYX.length - 1]);
        return simplified;
    }

    findPath(startAdmin, endAdmin) {
        if (!this.pathfinding) return null;

        // Admin coords to grid coords
        // PathfindingService expects [y, x] format
        const startGrid = [
            Math.floor(startAdmin.y / this.gridCellSize),
            Math.floor(startAdmin.x / this.gridCellSize)
        ];
        const endGrid = [
            Math.floor(endAdmin.y / this.gridCellSize),
            Math.floor(endAdmin.x / this.gridCellSize)
        ];

        const path = this.pathfinding.findPath(startGrid, endGrid);

        if (!path || path.length === 0) {
            // Fallback: straight line
            return [
                adminToThreeRoute(startAdmin.x, startAdmin.y),
                adminToThreeRoute(endAdmin.x, endAdmin.y)
            ];
        }

        // Center path between obstacles
        const centered = this.centerPathInCorridors(path);
        const stabilized = this.deJitterCenteredPath(centered);
        const simplified = this.simplifyPath(stabilized);

        // Convert grid path [y, x] back to admin coords, then to Three.js
        const threePoints = simplified.map(([gridY, gridX]) => {
            const adminX = (gridX + 0.5) * this.gridCellSize;
            const adminY = (gridY + 0.5) * this.gridCellSize;
            return adminToThreeRoute(adminX, adminY);
        });

        // Snap endpoints to exact positions
        if (threePoints.length > 0) {
            threePoints[0] = adminToThreeRoute(startAdmin.x, startAdmin.y);
            threePoints[threePoints.length - 1] = adminToThreeRoute(endAdmin.x, endAdmin.y);
        }

        return threePoints;
    }

    computePathDistance(startAdmin, endAdmin) {
        const path = this.findPath(startAdmin, endAdmin);
        if (!path || path.length < 2) return Infinity;

        let dist = 0;
        for (let i = 1; i < path.length; i++) {
            const dx = path[i][0] - path[i - 1][0];
            const dz = path[i][2] - path[i - 1][2];
            dist += Math.sqrt(dx * dx + dz * dz);
        }
        return dist;
    }

    optimizeWaypointOrder(waypoints) {
        const n = waypoints.length;
        if (n <= 3) return waypoints.map((_, i) => i);

        const midIndices = [];
        for (let i = 1; i < n - 1; i++) midIndices.push(i);

        // Precompute distance matrix
        const dist = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const d = this.computePathDistance(waypoints[i], waypoints[j]);
                dist[i][j] = d;
                dist[j][i] = d;
            }
        }

        // Nearest-neighbor
        const visited = new Set([0, n - 1]);
        const order = [0];
        let current = 0;

        while (order.length < n - 1) {
            let bestIdx = -1, bestDist = Infinity;
            for (const idx of midIndices) {
                if (visited.has(idx)) continue;
                if (dist[current][idx] < bestDist) {
                    bestDist = dist[current][idx];
                    bestIdx = idx;
                }
            }
            if (bestIdx === -1) break;
            order.push(bestIdx);
            visited.add(bestIdx);
            current = bestIdx;
        }
        order.push(n - 1);

        // 2-opt improvement
        const totalDist = (ord) => {
            let s = 0;
            for (let i = 0; i < ord.length - 1; i++) s += dist[ord[i]][ord[i + 1]];
            return s;
        };

        let improved = true, iterations = 0;
        while (improved && iterations < 100) {
            improved = false;
            iterations++;
            for (let i = 1; i < order.length - 2; i++) {
                for (let j = i + 1; j < order.length - 1; j++) {
                    const oldCost = dist[order[i - 1]][order[i]] + dist[order[j]][order[j + 1]];
                    const newCost = dist[order[i - 1]][order[j]] + dist[order[i]][order[j + 1]];
                    if (newCost < oldCost - 0.001) {
                        const segment = order.slice(i, j + 1).reverse();
                        order.splice(i, j - i + 1, ...segment);
                        improved = true;
                    }
                }
            }
        }

        return order;
    }

    buildMultiRoute(waypoints) {
        if (!waypoints || waypoints.length < 2) return null;

        // Convert to admin coord objects
        const adminWaypoints = waypoints.map(wp => ({ x: wp.x, y: wp.y }));

        // Optimize order
        const optimizedOrder = this.optimizeWaypointOrder(adminWaypoints);
        const optimizedWaypoints = optimizedOrder.map(i => waypoints[i]);
        const optimizedAdmin = optimizedOrder.map(i => adminWaypoints[i]);

        // Build path segments and track waypoint boundaries
        const allPoints = [];
        const segmentBoundaries = [0]; // point index for each waypoint
        for (let i = 0; i < optimizedAdmin.length - 1; i++) {
            const segment = this.findPath(optimizedAdmin[i], optimizedAdmin[i + 1]);
            if (segment) {
                if (i === 0) allPoints.push(...segment);
                else allPoints.push(...segment.slice(1));
            }
            segmentBoundaries.push(allPoints.length - 1);
        }

        if (allPoints.length === 0) return null;

        // Compute cumulative arc lengths at each point
        const cumLen = [0];
        for (let i = 1; i < allPoints.length; i++) {
            const dx = allPoints[i][0] - allPoints[i - 1][0];
            const dz = allPoints[i][2] - allPoints[i - 1][2];
            cumLen.push(cumLen[i - 1] + Math.sqrt(dx * dx + dz * dz));
        }
        const totalLen = cumLen[cumLen.length - 1];

        // Compute passedT fraction for each waypoint boundary
        const waypointT = segmentBoundaries.map(idx => totalLen > 0 ? cumLen[idx] / totalLen : 0);

        const distMeters = Math.round(totalLen / SCALE * 0.1);
        const timeMin = Math.ceil(distMeters / 80);

        return {
            points: allPoints,
            waypoints: optimizedWaypoints,
            waypointT,
            info: {
                from: optimizedWaypoints[0]?.name || 'Вход',
                to: optimizedWaypoints[optimizedWaypoints.length - 1]?.name || 'Выход',
                distance: distMeters,
                time: timeMin
            }
        };
    }

    buildSimpleRoute(source, dest) {
        const path = this.findPath(
            { x: source.x, y: source.y },
            { x: dest.x, y: dest.y }
        );

        if (!path || path.length === 0) return null;

        let distance = 0;
        for (let i = 1; i < path.length; i++) {
            const dx = path[i][0] - path[i - 1][0];
            const dz = path[i][2] - path[i - 1][2];
            distance += Math.sqrt(dx * dx + dz * dz);
        }
        const distMeters = Math.round(distance / SCALE * 0.1);
        const timeMin = Math.ceil(distMeters / 80);

        return {
            points: path,
            waypoints: [source, dest],
            info: {
                from: source.name || 'Вход',
                to: dest.name || 'Категория',
                distance: distMeters,
                time: timeMin
            }
        };
    }
}
