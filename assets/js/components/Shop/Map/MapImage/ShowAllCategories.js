import L from "leaflet";
import {adminToLeaflet} from "../../../Utils/coordinateUtils";
import { CustomMarker } from "./CustomMarker";

// Хранилище маркеров для каждой карты
const markersStorage = new WeakMap();

export function ShowAllCategories(map, categories, shop, aiCategories = [], routeCategoryIds = new Set(), selectedCategory = null, selectedProduct = null) {
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

    // Построим карту categoryId → commodities из AI-результата
    const aiCommoditiesMap = {};
    const aiCategoryIds = new Set();
    if (Array.isArray(aiCategories)) {
        aiCategories.forEach(cat => {
            if (cat.id) {
                aiCategoryIds.add(cat.id);
                if (cat.commodities && cat.commodities.length > 0) {
                    aiCommoditiesMap[cat.id] = cat.commodities;
                }
            }
        });
    }

    if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(categoryData => {
            // Skip categories that have route waypoint markers (Task 2)
            if (routeCategoryIds.has(categoryData.id)) return;

            if (categoryData.x_coordinate !== undefined && categoryData.y_coordinate !== undefined) {
                const categoryPoint = adminToLeaflet(categoryData.x_coordinate, categoryData.y_coordinate);
                
                const title = categoryData.title || categoryData.category?.title || 'Категория';

                const commodities = aiCommoditiesMap[categoryData.id] || [];
                // Only AI-found categories are targets
                const isTarget = aiCategoryIds.has(categoryData.id);

                const marker = CustomMarker.createShopMarker(
                    categoryPoint,
                    title,
                    categoryData.id,
                    commodities,
                    isTarget
                );
                
                marker.addTo(map);
                markers.push(marker);
            }
        });
    }
    
    // Добавляем маркеры входа и выхода (координаты из Shop entity или fallback)
    const entranceX = shop?.entranceX ?? 0;
    const entranceY = shop?.entranceY ?? 50;
    const exitX = shop?.exitX ?? 0;
    const exitY = shop?.exitY ?? 200;

    const entranceMarker = CustomMarker.createEntranceMarker(adminToLeaflet(entranceX, entranceY));
    entranceMarker.addTo(map);
    markers.push(entranceMarker);
    
    const exitMarker = CustomMarker.createExitMarker(adminToLeaflet(exitX, exitY));
    exitMarker.addTo(map);
    markers.push(exitMarker);
}
