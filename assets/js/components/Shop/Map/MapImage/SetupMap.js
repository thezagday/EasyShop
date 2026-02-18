import L from "leaflet";
import { InteractiveLayer } from "./InteractiveLayer";
import { adminToLeaflet } from "../../../Utils/coordinateUtils";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export function SetupMap(map, mapImageUrl = "/img/map.svg", shop = null) {
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
    
    
    // Создаем интерактивный слой для будущего использования
    const interactiveLayer = new InteractiveLayer(map);
    
    return {
        map,
        interactiveLayer
    };
}