import L from "leaflet";
import { InteractiveLayer } from "./InteractiveLayer";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export function SetupMap(map, mapImageUrl = "/img/map.svg") {
    const bounds = [[0, 0], [993, 1653]];

    if (map.__easyShopBaseImageOverlay) {
        map.removeLayer(map.__easyShopBaseImageOverlay);
        map.__easyShopBaseImageOverlay = null;
    }

    if (map.__easyShopCurrentLocationMarker) {
        map.removeLayer(map.__easyShopCurrentLocationMarker);
        map.__easyShopCurrentLocationMarker = null;
    }

    const image = L.imageOverlay(mapImageUrl, bounds, {
        opacity: 1,
        className: 'map-image-overlay',
        interactive: false
    }).addTo(map);

    map.__easyShopBaseImageOverlay = image;

    const padding = [60, 60];

    const applyInitialView = () => {
        map.setMaxBounds(bounds);
        map.fitBounds(image.getBounds(), { padding });

        const fitZoom = map.getBoundsZoom(bounds, false, padding);

        map.setMinZoom(fitZoom - 2);
        map.setMaxZoom(fitZoom + 4);
        map.setZoom(fitZoom);
    };

    applyInitialView();

    setTimeout(() => {
        map.invalidateSize();
        applyInitialView();
    }, 0);
    
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

    map.__easyShopCurrentLocationMarker = currentLocationMarker;
    
    // Создаем интерактивный слой для будущего использования
    const interactiveLayer = new InteractiveLayer(map);
    
    return {
        map,
        interactiveLayer,
        currentLocationMarker
    };
}