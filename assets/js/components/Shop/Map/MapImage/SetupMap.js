import L from "leaflet";
import { InteractiveLayer } from "./InteractiveLayer";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export function SetupMap(map, mapImageUrl = "/img/map.svg") {
    const bounds = [[0, 0], [993, 1653]];
    const image = L.imageOverlay(mapImageUrl, bounds, {
        opacity: 0.85,
        interactive: false
    }).addTo(map);

    map.fitBounds(image.getBounds());
    map.setMaxBounds(map.getBounds());
    
    // Улучшенные настройки карты
    map.setMinZoom(-1);
    map.setMaxZoom(3);
    
    // Добавляем плавную анимацию при перемещении
    map.options.zoomAnimation = true;
    map.options.fadeAnimation = true;
    map.options.markerZoomAnimation = true;
    
    // Добавляем маркер "Вы здесь" на входе
    const entrancePosition = [50, 0]; // Координаты входа
    const currentLocationMarker = L.marker(entrancePosition, {
        icon: L.divIcon({
            className: 'current-location-marker',
            html: `
                <div class="current-location-pulse">
                    <div class="current-location-dot"></div>
                    <div class="current-location-ring"></div>
                </div>
                <div class="current-location-label">Вы здесь</div>
            `,
            iconSize: [60, 80],
            iconAnchor: [30, 40]
        }),
        zIndexOffset: 10000
    }).addTo(map);
    
    // Создаем интерактивный слой для будущего использования
    const interactiveLayer = new InteractiveLayer(map);
    
    return {
        map,
        interactiveLayer,
        currentLocationMarker
    };
}