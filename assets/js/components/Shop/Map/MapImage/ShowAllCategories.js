import L from "leaflet";
import {xy} from "../../../Utils/coordinateUtils";
import { CustomMarker } from "./CustomMarker";

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

    if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(categoryData => {
            if (categoryData.x_coordinate !== undefined && categoryData.y_coordinate !== undefined) {
                const categoryPoint = xy(categoryData.x_coordinate, categoryData.y_coordinate);
                
                // Используем кастомный маркер вместо простого красного
                const title = categoryData.title || categoryData.category?.title || 'Категория';
                const categoryName = categoryData.category?.parent?.title || 'Общее';
                
                const marker = CustomMarker.createShopMarker(
                    categoryPoint,
                    title,
                    categoryName,
                    categoryData.id
                );
                
                marker.addTo(map);
                markers.push(marker);
            }
        });
    }
    
    // Добавляем маркеры входа и выхода
    const entranceMarker = CustomMarker.createEntranceMarker([0, 50]);
    entranceMarker.addTo(map);
    markers.push(entranceMarker);
    
    const exitMarker = CustomMarker.createExitMarker([0, 200]);
    exitMarker.addTo(map);
    markers.push(exitMarker);
}
