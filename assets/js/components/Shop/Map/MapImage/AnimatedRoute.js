import L from 'leaflet';
import 'leaflet-geometryutil';

export class AnimatedRoute {
    constructor(map) {
        this.map = map;
        this.routeLayer = null;
        this.markers = [];
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

    drawAnimatedRoute(path, startMarker = null, endMarker = null) {
        this.clearRoute();

        if (!path || path.length < 2) {
            console.warn('Path is too short');
            return;
        }

        const polyline = L.polyline(path, {
            color: '#4285F4',
            weight: 5,
            opacity: 0.8,
            smoothFactor: 1,
            className: 'animated-route',
            lineCap: 'round',
            lineJoin: 'round'
        });

        this.routeLayer = polyline.addTo(this.map);

        if (startMarker) {
            this.markers.push(startMarker.addTo(this.map));
        }

        if (endMarker) {
            this.markers.push(endMarker.addTo(this.map));
        }

        this.addDirectionArrows(path);

        this.map.fitBounds(polyline.getBounds(), {
            padding: [50, 50],
            maxZoom: 2
        });

        return this.routeLayer;
    }

    addDirectionArrows(path) {
        if (path.length < 2) return;

        const arrowSpacing = 50;
        let accumulatedDistance = 0;

        for (let i = 1; i < path.length; i++) {
            const start = L.latLng(path[i - 1]);
            const end = L.latLng(path[i]);
            const segmentDistance = start.distanceTo(end);

            accumulatedDistance += segmentDistance;

            if (accumulatedDistance >= arrowSpacing) {
                const angle = this.calculateBearing(start, end);
                
                const arrowIcon = L.divIcon({
                    className: 'route-arrow',
                    html: `<div style="transform: rotate(${angle}deg); color: #4285F4; font-size: 16px;">→</div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                const arrowMarker = L.marker(end, { icon: arrowIcon });
                this.markers.push(arrowMarker.addTo(this.map));

                accumulatedDistance = 0;
            }
        }
    }

    calculateBearing(start, end) {
        const startLat = start.lat * Math.PI / 180;
        const startLng = start.lng * Math.PI / 180;
        const endLat = end.lat * Math.PI / 180;
        const endLng = end.lng * Math.PI / 180;

        const dLng = endLng - startLng;

        const y = Math.sin(dLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
                  Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

        const bearing = Math.atan2(y, x);
        return (bearing * 180 / Math.PI + 360) % 360;
    }

    highlightWaypoints(waypoints) {
        waypoints.forEach((point, index) => {
            const waypointIcon = L.divIcon({
                className: 'waypoint-marker',
                html: `<div style="background: white; border: 3px solid #4285F4; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #4285F4;">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker(point, { icon: waypointIcon });
            this.markers.push(marker.addTo(this.map));
        });
    }
}
