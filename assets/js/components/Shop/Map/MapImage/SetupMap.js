import L from "leaflet";
import { InteractiveLayer } from "./InteractiveLayer";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export function SetupMap(map) {
    const bounds = [[0, 0], [993, 1653]];
    const image = L.imageOverlay("/img/map.svg", bounds, {
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
    
    // Создаем интерактивный слой для будущего использования
    const interactiveLayer = new InteractiveLayer(map);
    
    return {
        map,
        interactiveLayer
    };
}