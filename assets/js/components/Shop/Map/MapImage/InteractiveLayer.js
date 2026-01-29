import L from 'leaflet';

export class InteractiveLayer {
    constructor(map) {
        this.map = map;
        this.rooms = new Map();
        this.corridors = [];
    }

    addRoom(id, coordinates, metadata) {
        const polygon = L.polygon(coordinates, {
            color: metadata.color || '#667eea',
            fillColor: metadata.fillColor || '#667eea',
            fillOpacity: 0.2,
            weight: 2,
            className: 'room-highlight'
        });

        polygon.on('mouseover', (e) => {
            e.target.setStyle({
                fillOpacity: 0.35,
                weight: 4
            });
        });

        polygon.on('mouseout', (e) => {
            e.target.setStyle({
                fillOpacity: 0.2,
                weight: 2
            });
        });

        polygon.on('click', () => {
            if (metadata.onClick) {
                metadata.onClick(metadata);
            }
        });

        if (metadata.name) {
            polygon.bindTooltip(metadata.name, {
                permanent: false,
                direction: 'center',
                className: 'room-tooltip'
            });
        }

        this.rooms.set(id, {
            layer: polygon,
            metadata
        });

        polygon.addTo(this.map);
        return polygon;
    }

    addCorridor(coordinates, walkable = true) {
        const polyline = L.polyline(coordinates, {
            color: walkable ? '#e2e8f0' : '#fc8181',
            weight: 3,
            opacity: 0.6,
            dashArray: walkable ? null : '5, 10'
        });

        this.corridors.push(polyline);
        polyline.addTo(this.map);
        return polyline;
    }

    highlightRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.layer.setStyle({
                fillColor: '#4285F4',
                fillOpacity: 0.4,
                weight: 4
            });

            room.layer.openTooltip();

            setTimeout(() => {
                room.layer.setStyle({
                    fillColor: room.metadata.fillColor || '#667eea',
                    fillOpacity: 0.2,
                    weight: 2
                });
            }, 2000);
        }
    }

    removeRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            this.map.removeLayer(room.layer);
            this.rooms.delete(roomId);
        }
    }

    clearAllRooms() {
        this.rooms.forEach(room => {
            this.map.removeLayer(room.layer);
        });
        this.rooms.clear();
    }

    clearAllCorridors() {
        this.corridors.forEach(corridor => {
            this.map.removeLayer(corridor);
        });
        this.corridors = [];
    }

    getWalkableAreas() {
        const walkableAreas = [];

        this.rooms.forEach(room => {
            if (room.metadata.walkable) {
                const bounds = room.layer.getBounds();
                walkableAreas.push({
                    x: bounds.getWest(),
                    y: bounds.getSouth(),
                    width: bounds.getEast() - bounds.getWest(),
                    height: bounds.getNorth() - bounds.getSouth()
                });
            }
        });

        return walkableAreas;
    }
}
