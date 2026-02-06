import L from "leaflet";
import { xy, adminToLeaflet } from "../../../Utils/coordinateUtils";
import { PathfindingService } from "./PathfindingService";
import { generateWalkableGrid, OBSTACLE_MAP } from "./ObstacleMap";

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
    }

    buildRoute(sourceCoords, destCoords, sourceName = 'Вход', destName = 'Категория') {
        this.clearRoute();

        let routePoints = [];
        let waypointNames = [];

        // Check if sourceCoords is an array (multi-point route)
        if (Array.isArray(sourceCoords)) {
            // Multi-point route with pathfinding between each waypoint
            const waypoints = sourceCoords.map(wp => adminToLeaflet(wp.x, wp.y));
            waypointNames = sourceCoords.map(wp => wp.name);
            
            // Build path through all waypoints
            routePoints = this.buildMultiWaypointPath(waypoints);
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
            // Fallback to direct distance
            const dy = end[0] - start[0];
            const dx = end[1] - start[1];
            distanceInMeters = Math.round(Math.sqrt(dx * dx + dy * dy) * 0.1);
        }
        
        const timeInMinutes = Math.ceil(distanceInMeters / 80);

        // Remove existing info panel
        const existingPanel = this.map.getContainer().querySelector('.route-info-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create info panel
        const infoPanel = L.DomUtil.create('div', 'route-info-panel');
        
        const waypointInfo = waypointCount > 2 
            ? `<div class="route-info-item">
                    <span class="route-info-label">Точек маршрута:</span>
                    <span class="route-info-value">${waypointCount}</span>
                </div>`
            : '';

        infoPanel.innerHTML = `
            <div class="route-info-header">
                <span class="route-info-icon">🗺️</span>
                <span class="route-info-title">Маршрут построен</span>
                <button class="route-info-close">&times;</button>
            </div>
            <div class="route-info-body">
                <div class="route-info-item">
                    <span class="route-info-label">От:</span>
                    <span class="route-info-value">${sourceName}</span>
                </div>
                <div class="route-info-item">
                    <span class="route-info-label">До:</span>
                    <span class="route-info-value">${destName}</span>
                </div>
                ${waypointInfo}
                <div class="route-info-item">
                    <span class="route-info-label">Расстояние:</span>
                    <span class="route-info-value">~${distanceInMeters}м</span>
                </div>
                <div class="route-info-item">
                    <span class="route-info-label">Время:</span>
                    <span class="route-info-value">~${timeInMinutes} мин</span>
                </div>
            </div>
        `;

        this.map.getContainer().appendChild(infoPanel);

        // Close button handler — only hide the info panel, keep the route visible
        const closeBtn = infoPanel.querySelector('.route-info-close');
        closeBtn.addEventListener('click', () => {
            infoPanel.remove();
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (infoPanel.parentElement) {
                infoPanel.style.opacity = '0';
                setTimeout(() => infoPanel.remove(), 300);
            }
        }, 10000);
    }
}
