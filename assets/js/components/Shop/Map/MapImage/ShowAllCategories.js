import L from "leaflet";
import {xy} from "../../../Utils/coordinateUtils"

// Хранилище маркеров для каждой карты
const markersStorage = new WeakMap();

export function ShowAllCategories(map, categories) {
    // Получаем или создаем массив маркеров для этой карты
    if (!markersStorage.has(map)) {
        markersStorage.set(map, []);
    }
    const markers = markersStorage.get(map);
    
    // Удаляем старые маркеры
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers.length = 0;

    // Создаем красную иконку для маркеров
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(categoryData => {
            if (categoryData.x_coordinate !== undefined && categoryData.y_coordinate !== undefined) {
                const categoryPoint = xy(categoryData.x_coordinate, categoryData.y_coordinate);
                const marker = L.marker(categoryPoint, { icon: redIcon }).addTo(map);
                
                const title = categoryData.title || categoryData.category?.title || 'Категория';
                marker.bindPopup(title, {
                    autoClose: false,
                    closeOnClick: false
                });
                
                markers.push(marker);
            }
        });
    }
}
