import L from "leaflet";
import { xy } from "../../../Utils/coordinateUtils";
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
            const waypoints = sourceCoords.map(wp => xy(wp.x, wp.y));
            waypointNames = sourceCoords.map(wp => wp.name);
            
            // Build path through all waypoints
            routePoints = this.buildMultiWaypointPath(waypoints);
        } else {
            // Simple two-point route with pathfinding
            const start = xy(sourceCoords.x, sourceCoords.y);
            const end = xy(destCoords.x, destCoords.y);
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

        // Add waypoint markers
        routePoints.forEach((point, index) => {
            let markerIcon;
            
            if (index === 0) {
                // Start marker
                markerIcon = L.divIcon({
                    className: 'route-marker-start',
                    html: `
                        <div class="route-marker">
                            <div class="route-marker-icon start">🚪</div>
                            <div class="route-marker-label">${waypointNames[index]}</div>
                        </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                });
            } else if (index === routePoints.length - 1) {
                // End marker
                markerIcon = L.divIcon({
                    className: 'route-marker-end',
                    html: `
                        <div class="route-marker">
                            <div class="route-marker-icon end">🚶</div>
                            <div class="route-marker-label">${waypointNames[index]}</div>
                        </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                });
            } else {
                // Intermediate waypoint
                markerIcon = L.divIcon({
                    className: 'route-marker-waypoint',
                    html: `
                        <div class="route-marker">
                            <div class="route-marker-icon waypoint">${index}</div>
                            <div class="route-marker-label">${waypointNames[index]}</div>
                        </div>
                    `,
                    iconSize: [60, 60],
                    iconAnchor: [30, 30]
                });
            }

            const marker = L.marker(point, { icon: markerIcon }).addTo(this.map);
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
        // Convert map coordinates to grid coordinates
        const startGrid = [
            start[0],
            start[1]
        ];
        const endGrid = [
            end[0],
            end[1]
        ];

        // Find path using A*
        const path = this.pathfinding.findPath(startGrid, endGrid);
        
        if (!path || path.length === 0) {
            console.warn('No path found, using direct line');
            return [start, end];
        }

        // Smooth the path for better visual appearance
        const smoothedPath = this.pathfinding.smoothPath(path, 3);
        
        return smoothedPath || [start, end];
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

        // Close button handler
        const closeBtn = infoPanel.querySelector('.route-info-close');
        closeBtn.addEventListener('click', () => {
            infoPanel.remove();
            this.clearRoute();
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
