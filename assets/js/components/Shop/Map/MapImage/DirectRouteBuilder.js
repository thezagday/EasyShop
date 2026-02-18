import L from "leaflet";
import { xy, adminToLeaflet } from "../../../Utils/coordinateUtils";
import { PathfindingService } from "./PathfindingService";
import { generateWalkableGrid, OBSTACLE_MAP } from "./ObstacleMap";
import { TrackingService } from "../../../../services/TrackingService";

export class DirectRouteBuilder {
    constructor(map) {
        this.map = map;
        this.routeLayer = null;
        this.markers = [];
        this.pathfinding = null;
        this.initializePathfinding();
    }

    // Метод для переинициализации pathfinding после загрузки препятствий
    reinitializePathfinding() {
        console.log('🔄 Reinitializing pathfinding with loaded obstacles');
        this.pathfinding = new PathfindingService();
    }

    initializePathfinding() {
        const gridData = generateWalkableGrid();
        this.pathfinding = new PathfindingService(gridData.gridWidth, gridData.gridHeight);
        
        // Инициализируем сетку с проходимыми областями
        this.pathfinding.initializeGrid(gridData.walkableAreas);
        
        // Отмечаем препятствия как непроходимые
        gridData.obstacles.forEach(obs => {
            for (let y = obs.y; y < obs.y + obs.height; y++) {
                for (let x = obs.x; x < obs.x + obs.width; x++) {
                    if (this.pathfinding.grid && 
                        x >= 0 && x < gridData.gridWidth && 
                        y >= 0 && y < gridData.gridHeight) {
                        this.pathfinding.grid.setWalkableAt(x, y, false);
                    }
                }
            }
        });
        
        console.log('Pathfinding initialized with grid:', gridData.gridWidth, 'x', gridData.gridHeight);
    }

    clearRoute() {
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
        
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];

        // Clear React route info
        if (typeof this.onRouteInfoCallback === 'function') {
            this.onRouteInfoCallback(null);
        }
    }

    /**
     * Compute A* path distance between two Leaflet points.
     * Returns the path length in grid units, or Infinity if no path found.
     */
    computePathDistance(pointA, pointB) {
        const path = this.findPathWithObstacles(pointA, pointB);
        if (!path || path.length < 2) return Infinity;

        let dist = 0;
        for (let i = 1; i < path.length; i++) {
            const dy = path[i][0] - path[i - 1][0];
            const dx = path[i][1] - path[i - 1][1];
            dist += Math.sqrt(dx * dx + dy * dy);
        }
        return dist;
    }

    /**
     * Optimize waypoint order using TSP heuristics.
     * Entrance (index 0) stays first, Exit (last index) stays last.
     * Only intermediate waypoints (categories) are reordered.
     *
     * @param {Array} waypoints - Leaflet coords [{lat,lng}, ...]
     * @returns {Array<number>} - optimized index order
     */
    optimizeWaypointOrder(waypoints) {
        const n = waypoints.length;
        if (n <= 3) return waypoints.map((_, i) => i); // entrance + 0-1 categories + exit — nothing to optimize

        // Indices: 0 = entrance, 1..n-2 = categories, n-1 = exit
        const midIndices = [];
        for (let i = 1; i < n - 1; i++) midIndices.push(i);

        // Precompute distance matrix for all waypoints
        const dist = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const d = this.computePathDistance(waypoints[i], waypoints[j]);
                dist[i][j] = d;
                dist[j][i] = d;
            }
        }

        console.log('📊 Distance matrix computed for', n, 'waypoints');

        // ── Nearest-neighbor heuristic ──
        // Start from entrance (0), greedily pick nearest unvisited category, end at exit
        const visited = new Set();
        const order = [0]; // start with entrance
        visited.add(0);
        visited.add(n - 1); // reserve exit for last

        let current = 0;
        while (order.length < n - 1) { // n-1 because exit is appended at end
            let bestIdx = -1;
            let bestDist = Infinity;
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
        order.push(n - 1); // end with exit

        // ── 2-opt improvement ──
        // Only swap intermediate nodes (indices 1..order.length-2)
        const totalDist = (ord) => {
            let s = 0;
            for (let i = 0; i < ord.length - 1; i++) s += dist[ord[i]][ord[i + 1]];
            return s;
        };

        let improved = true;
        let iterations = 0;
        const maxIterations = 100;
        while (improved && iterations < maxIterations) {
            improved = false;
            iterations++;
            // Only reverse segments within the middle portion (skip index 0 and last)
            for (let i = 1; i < order.length - 2; i++) {
                for (let j = i + 1; j < order.length - 1; j++) {
                    // Cost of current edges: (i-1→i) + (j→j+1)
                    const oldCost = dist[order[i - 1]][order[i]] + dist[order[j]][order[j + 1]];
                    // Cost if we reverse segment [i..j]: (i-1→j) + (i→j+1)
                    const newCost = dist[order[i - 1]][order[j]] + dist[order[i]][order[j + 1]];
                    if (newCost < oldCost - 0.001) {
                        // Reverse segment [i..j]
                        const segment = order.slice(i, j + 1).reverse();
                        order.splice(i, j - i + 1, ...segment);
                        improved = true;
                    }
                }
            }
        }

        console.log('🛣️ Route optimized: distance', Math.round(totalDist(order)), '(2-opt iterations:', iterations, ')');
        return order;
    }

    /**
     * Smooth route points using Catmull-Rom spline interpolation.
     * Produces curves similar to Google/Yandex Maps routing.
     */
    smoothRoutePoints(points, pointsPerSegment = 6) {
        if (points.length < 3) return points;

        const result = [];

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(i - 1, 0)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(i + 2, points.length - 1)];

            for (let t = 0; t < pointsPerSegment; t++) {
                const f = t / pointsPerSegment;
                const f2 = f * f;
                const f3 = f2 * f;

                // Catmull-Rom coefficients
                const c0 = -0.5 * f3 + f2 - 0.5 * f;
                const c1 = 1.5 * f3 - 2.5 * f2 + 1;
                const c2 = -1.5 * f3 + 2 * f2 + 0.5 * f;
                const c3 = 0.5 * f3 - 0.5 * f2;

                const lat = c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0];
                const lng = c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1];
                result.push([lat, lng]);
            }
        }

        // Add the last point
        result.push(points[points.length - 1]);
        return result;
    }

    buildRoute(sourceCoords, destCoords, sourceName = 'Вход', destName = 'Категория') {
        this.clearRoute();

        let routePoints = [];
        let waypointNames = [];

        // Store waypoints for tracking
        this.lastWaypoints = Array.isArray(sourceCoords) ? sourceCoords : [{ name: sourceName }, { name: destName }];

        // Check if sourceCoords is an array (multi-point route)
        if (Array.isArray(sourceCoords)) {
            // Convert to Leaflet coords
            const waypoints = sourceCoords.map(wp => adminToLeaflet(wp.x, wp.y));
            const names = sourceCoords.map(wp => wp.name);

            // Optimize order: entrance stays first, exit stays last, categories reordered
            const optimizedOrder = this.optimizeWaypointOrder(waypoints);
            const optimizedWaypoints = optimizedOrder.map(i => waypoints[i]);
            waypointNames = optimizedOrder.map(i => names[i]);

            // Reorder sourceCoords too so markers match
            const optimizedSourceCoords = optimizedOrder.map(i => sourceCoords[i]);
            // Replace sourceCoords reference for marker rendering below
            sourceCoords = optimizedSourceCoords;

            // Build path through optimized waypoints
            routePoints = this.buildMultiWaypointPath(optimizedWaypoints);
        } else {
            // Simple two-point route with pathfinding
            const start = adminToLeaflet(sourceCoords.x, sourceCoords.y);
            const end = adminToLeaflet(destCoords.x, destCoords.y);
            waypointNames = [sourceName, destName];
            
            // Use pathfinding to find route
            routePoints = this.findPathWithObstacles(start, end);
        }

        if (!routePoints || routePoints.length === 0) {
            console.error('Failed to build route');
            return null;
        }

        // Smooth the route for natural-looking curves
        routePoints = this.smoothRoutePoints(routePoints);

        // Draw animated route line
        const routeLine = L.polyline(routePoints, {
            color: '#667eea',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1,
            className: 'animated-route-line'
        }).addTo(this.map);

        this.routeLayer = routeLine;

        // Add pulsing effect to the route
        this.animateRoute(routeLine);

        // Add waypoint markers - only for named waypoints (start, end, and explicit waypoints)
        // Don't add markers for every point in the pathfinding result
        const explicitWaypoints = Array.isArray(sourceCoords) ? sourceCoords : [sourceCoords, destCoords];
        
        explicitWaypoints.forEach((wp, index) => {
            const wpLeaflet = adminToLeaflet(wp.x, wp.y);
            const wpPoint = Array.isArray(sourceCoords) ? 
                routePoints.find(p => Math.abs(p[0] - wpLeaflet.lat) < 1 && Math.abs(p[1] - wpLeaflet.lng) < 1) || [wpLeaflet.lat, wpLeaflet.lng] :
                (index === 0 ? routePoints[0] : routePoints[routePoints.length - 1]);
            
            let markerIcon;
            
            if (index === 0) {
                // Start marker
                markerIcon = L.divIcon({
                    className: 'route-marker-start',
                    html: `
                        <div class="route-marker">
                            <div class="route-marker-icon start">🚪</div>
                            <div class="route-marker-label">${waypointNames[0]}</div>
                        </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                });
            } else if (index === explicitWaypoints.length - 1) {
                // End marker
                markerIcon = L.divIcon({
                    className: 'route-marker-end',
                    html: `
                        <div class="route-marker">
                            <div class="route-marker-icon end">🎯</div>
                            <div class="route-marker-label">${waypointNames[waypointNames.length - 1]}</div>
                        </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                });
            } else {
                // Intermediate explicit waypoint (for multi-point routes)
                markerIcon = L.divIcon({
                    className: 'route-marker-waypoint',
                    html: `
                        <div class="route-marker">
                            <div class="route-marker-icon waypoint">${index}</div>
                            <div class="route-marker-label">${wp.name}</div>
                        </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                });
            }

            const marker = L.marker(wpPoint, { icon: markerIcon }).addTo(this.map);

            // Добавляем popup с товарами для промежуточных точек маршрута
            if (wp.commodities && wp.commodities.length > 0) {
                const commoditiesHtml = wp.commodities.map(c => `<li>${c}</li>`).join('');
                marker.bindPopup(`
                    <div class="shop-popup">
                        <h3>${wp.name}</h3>
                        <div class="shop-popup-commodities">
                            <div class="shop-popup-commodities-title">🛒 Нужно взять:</div>
                            <ul class="shop-popup-commodities-list">
                                ${commoditiesHtml}
                            </ul>
                        </div>
                    </div>
                `);
            }

            this.markers.push(marker);
        });

        // Fit map to show full route
        const bounds = L.latLngBounds(routePoints);
        this.map.fitBounds(bounds, {
            padding: [80, 80],
            maxZoom: 1,
            animate: true,
            duration: 0.5
        });

        // Show route info panel
        this.showRouteInfo(routePoints[0], routePoints[routePoints.length - 1], waypointNames[0], waypointNames[waypointNames.length - 1], routePoints.length);

        return routeLine;
    }

    findPathWithObstacles(start, end) {
        const { gridCellSize } = OBSTACLE_MAP;
        
        // Extract coordinates - handle both array [lat, lng] and Leaflet LatLng object
        const getCoords = (point) => {
            if (Array.isArray(point)) {
                return { lat: point[0], lng: point[1] };
            } else if (point && typeof point === 'object' && 'lat' in point) {
                // Leaflet LatLng object
                return { lat: point.lat, lng: point.lng };
            } else {
                console.error('Invalid coordinate format:', point);
                return { lat: 0, lng: 0 };
            }
        };

        const startCoords = getCoords(start);
        const endCoords = getCoords(end);
        
        // Convert Leaflet coordinates to grid coordinates
        // PathfindingService expects [y, x] format (note: different from typical [x, y])
        const startGrid = [
            Math.floor(startCoords.lat / gridCellSize),   // y = lat / cellSize
            Math.floor(startCoords.lng / gridCellSize)    // x = lng / cellSize
        ];
        const endGrid = [
            Math.floor(endCoords.lat / gridCellSize),     // y = lat / cellSize
            Math.floor(endCoords.lng / gridCellSize)      // x = lng / cellSize
        ];

        console.log('🗺️ Pathfinding coordinates:');
        console.log('  Start: lat=' + startCoords.lat + ', lng=' + startCoords.lng + ' → Grid[y,x]: [' + startGrid[0] + ', ' + startGrid[1] + ']');
        console.log('  End: lat=' + endCoords.lat + ', lng=' + endCoords.lng + ' → Grid[y,x]: [' + endGrid[0] + ', ' + endGrid[1] + ']');
        console.log('  Grid size: ' + this.pathfinding.gridWidth + ' x ' + this.pathfinding.gridHeight);

        // Find path using A*
        const path = this.pathfinding.findPath(startGrid, endGrid);
        
        if (!path || path.length === 0) {
            console.warn('⚠️ No path found by A*, using direct line');
            // Return coordinates in proper array format [lat, lng]
            return [[startCoords.lat, startCoords.lng], [endCoords.lat, endCoords.lng]];
        }

        console.log('✅ Path found with', path.length, 'points');

        const smoothedGridPath = this.pathfinding.smoothPathOnGrid(path);
        const finalGridPath = smoothedGridPath || path;

        // Convert grid path back to Leaflet coordinates
        // PathfindingService returns [y, x], convert to Leaflet [lat, lng]
        const leafletPath = finalGridPath.map(([gridY, gridX]) => [
            (gridY + 0.5) * gridCellSize,
            (gridX + 0.5) * gridCellSize
        ]);

        if (leafletPath.length > 0) {
            leafletPath[0] = [startCoords.lat, startCoords.lng];
            leafletPath[leafletPath.length - 1] = [endCoords.lat, endCoords.lng];
        }

        return leafletPath;
    }

    buildMultiWaypointPath(waypoints) {
        if (waypoints.length < 2) return waypoints;

        const fullPath = [];
        
        // Build path between each consecutive pair of waypoints
        for (let i = 0; i < waypoints.length - 1; i++) {
            const segmentPath = this.findPathWithObstacles(waypoints[i], waypoints[i + 1]);
            
            if (i === 0) {
                // Add all points for first segment
                fullPath.push(...segmentPath);
            } else {
                // Skip first point to avoid duplicates
                fullPath.push(...segmentPath.slice(1));
            }
        }
        
        return fullPath;
    }

    animateRoute(routeLine) {
        let offset = 0;
        const animate = () => {
            offset = (offset + 1) % 20;
            const element = routeLine.getElement();
            if (element) {
                element.style.strokeDasharray = '10, 10';
                element.style.strokeDashoffset = offset;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }

    showRouteInfo(start, end, sourceName, destName, waypointCount = 2) {
        // Calculate distance using actual route path
        let distanceInMeters = 0;
        
        if (this.routeLayer && this.routeLayer.getLatLngs) {
            const pathPoints = this.routeLayer.getLatLngs();
            for (let i = 1; i < pathPoints.length; i++) {
                const dy = pathPoints[i].lat - pathPoints[i-1].lat;
                const dx = pathPoints[i].lng - pathPoints[i-1].lng;
                distanceInMeters += Math.sqrt(dx * dx + dy * dy) * 0.1;
            }
            distanceInMeters = Math.round(distanceInMeters);
        } else {
            const dy = end[0] - start[0];
            const dx = end[1] - start[1];
            distanceInMeters = Math.round(Math.sqrt(dx * dx + dy * dy) * 0.1);
        }
        
        const timeInMinutes = Math.ceil(distanceInMeters / 80);

        // Send route info to React via callback (rendered outside map)
        if (typeof this.onRouteInfoCallback === 'function') {
            this.onRouteInfoCallback({
                from: sourceName,
                to: destName,
                distance: distanceInMeters,
                time: timeInMinutes,
            });
        }

        // Track route building
        if (this.shopId) {
            const routeCategories = this.lastWaypoints || [];
            TrackingService.trackRoute(this.shopId, routeCategories, distanceInMeters, timeInMinutes);
        }
    }
}
