import L from "leaflet";
import i18n from "../../../../i18n";
import {adminToLeaflet} from "../../../Utils/coordinateUtils";
import { CustomMarker } from "./CustomMarker";

// Marker storage for each map
const markersStorage = new WeakMap();

export function ShowAllCategories(map, categories, shop, aiCategories = [], routeCategoryIds = new Set(), selectedCategory = null, selectedProduct = null) {
    // Get or create markers array for this map
    if (!markersStorage.has(map)) {
        markersStorage.set(map, []);
    }
    const markers = markersStorage.get(map);
    
    // Remove old markers
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers.length = 0;

    // Build categoryId -> commodities map from AI result
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
                
                const title = categoryData.title || categoryData.category?.title || i18n.t('ai.category');

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
    
    // Add entrance and exit markers (coordinates from Shop entity or fallback)
    const entranceX = shop?.entranceX ?? 0;
    const entranceY = shop?.entranceY ?? 50;
    const exitX = shop?.exitX ?? 0;
    const exitY = shop?.exitY ?? 200;

    const entranceMarker = CustomMarker.createEntranceMarker(adminToLeaflet(entranceX, entranceY));
    entranceMarker.bindTooltip(i18n.t('shop.entrance'), { 
        permanent: false,
        direction: 'top',
        className: 'room-tooltip'
    });
    entranceMarker.addTo(map);
    markers.push(entranceMarker);
    
    const exitMarker = CustomMarker.createExitMarker(adminToLeaflet(exitX, exitY));
    exitMarker.bindTooltip(i18n.t('shop.exit'), {
        permanent: false,
        direction: 'top',
        className: 'room-tooltip'
    });
    exitMarker.addTo(map);
    markers.push(exitMarker);
}
