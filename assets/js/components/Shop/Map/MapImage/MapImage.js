import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { SetupMap } from "./SetupMap";
import { ShowAllCategories } from "./ShowAllCategories";
import { CategorySearch } from "./CategorySearch";
import { CommoditySearch } from "./CommoditySearch";
import { MultiCommoditySearch } from "./MultiCommoditySearch";
import { DirectRouteBuilder } from "./DirectRouteBuilder";
import { OBSTACLE_MAP, loadObstaclesForShop } from "./ObstacleMap";
import { adminToLeaflet } from "../../../Utils/coordinateUtils";

delete L.Icon.Default.prototype._getIconUrl;

export default function MapImage({
    shopId,
    shop,
    mapImageUrl,
    isBuildRouteClicked,
    categories,
    source,
    destination,
    postBuildRoute,
    searchedCategory,
    searchedCategoryByCommodity,
    multiSearch,
    selectedCategory,
    selectedProduct,
    aiCategories,
    onBuildRoute,
    onRouteReset,
    onRouteInfo,
}) {
    const map = useMap();
    const routeBuilderRef = useRef(null);
    const [obstaclesLoaded, setObstaclesLoaded] = useState(false);

    // Load obstacles from API when component mounts
    useEffect(() => {
        if (shopId) {
            loadObstaclesForShop(shopId).then(() => {
                setObstaclesLoaded(true);
            });
        }
    }, [shopId]);

    // Initialize route builder
    useEffect(() => {
        if (!routeBuilderRef.current) {
            routeBuilderRef.current = new DirectRouteBuilder(map);
        }
        if (routeBuilderRef.current) {
            routeBuilderRef.current.onResetCallback = onRouteReset;
            routeBuilderRef.current.onRouteInfoCallback = onRouteInfo;
            routeBuilderRef.current.shopId = shopId;
        }
    }, [map, onRouteReset, onRouteInfo]);

    // Определяем список активных категорий для фильтрации
    const activeCategoryIds = new Set();
    if (selectedCategory?.id) activeCategoryIds.add(selectedCategory.id);
    if (selectedProduct?.categoryId) activeCategoryIds.add(selectedProduct.categoryId);

    if (aiCategories && aiCategories.length > 0) {
        aiCategories.forEach(cat => {
            if (cat.id) activeCategoryIds.add(cat.id);
            else if (cat.categoryId) activeCategoryIds.add(cat.categoryId);
        });
    }

    if (destination?.categoryId) activeCategoryIds.add(destination.categoryId);

    if (Array.isArray(source)) {
        source.forEach(wp => {
            if (wp.categoryId) activeCategoryIds.add(wp.categoryId);
        });
    } else if (source?.categoryId) {
        activeCategoryIds.add(source.categoryId);
    }

    // Показываем либо отфильтрованные категории, либо все, если ничего не выбрано
    const visibleCategories = activeCategoryIds.size > 0
        ? categories.filter(cat => activeCategoryIds.has(cat.id))
        : categories;

    // Показываем категории с кастомными маркерами (передаём aiCategories для товаров в popup)
    ShowAllCategories(map, visibleCategories, shop, aiCategories);

    // CategorySearch(map, searchedCategory);
    CommoditySearch(map, searchedCategoryByCommodity);
    // MultiCommoditySearch(map, multiSearch);

    // Построение маршрута когда установлены координаты source/destination
    useEffect(() => {
        if (routeBuilderRef.current) {
            // Multi-point route (array of waypoints)
            if (Array.isArray(source) && source.length > 0) {
                routeBuilderRef.current.buildRoute(source);
            }
            // Simple two-point route
            else if (source && destination && typeof source === 'object' && typeof destination === 'object') {
                routeBuilderRef.current.buildRoute(
                    { x: source.x, y: source.y },
                    { x: destination.x, y: destination.y },
                    source.name,
                    destination.name
                );
            }
            // Source reset — clear previous route
            else if (!source) {
                routeBuilderRef.current.clearRoute();
            }
        }
    }, [source, destination, map]);

    useEffect(() => {
        SetupMap(map, mapImageUrl, shop);
    }, [map, mapImageUrl]);

    useEffect(() => {
        if (!obstaclesLoaded) return;

        // Re-initialize route builder after obstacles are loaded
        if (routeBuilderRef.current) {
            routeBuilderRef.current.initializePathfinding();
        }
    }, [obstaclesLoaded, map]);

    // Обработка кликов по кнопкам "Построить маршрут" в popup
    useEffect(() => {
        const handlePopupClick = (e) => {
            const button = e.target.closest('[data-action="build-route"]');
            if (button && onBuildRoute) {
                const categoryId = button.getAttribute('data-category-id');
                if (categoryId) {
                    onBuildRoute(parseInt(categoryId));
                }
            }
        };

        map.getContainer().addEventListener('click', handlePopupClick);

        return () => {
            map.getContainer().removeEventListener('click', handlePopupClick);
        };
    }, [map, onBuildRoute]);

    // Обработка выбора категории из поиска - центрируем и подсвечиваем
    useEffect(() => {
        if (selectedCategory) {
            // Конвертируем административные координаты в координаты Leaflet
            const leafletPos = adminToLeaflet(selectedCategory.x, selectedCategory.y);

            // Центрируем карту на выбранной категории
            map.setView(leafletPos, 1, {
                animate: true,
                duration: 0.5
            });

            // Находим маркер выбранной категории и открываем его popup
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getLatLng) {
                    const pos = layer.getLatLng();
                    if (Math.abs(pos.lat - leafletPos.lat) < 1 && Math.abs(pos.lng - leafletPos.lng) < 1) {
                        // Анимированное открытие popup с задержкой
                        setTimeout(() => {
                            layer.openPopup();
                        }, 500);
                    }
                }
            });
        }
    }, [selectedCategory, map]);

    // Обработка выбора товара из поиска - центрируем на категории товара
    useEffect(() => {
        if (selectedProduct && selectedProduct.x && selectedProduct.y) {
            // Конвертируем административные координаты в координаты Leaflet
            const leafletPos = adminToLeaflet(selectedProduct.x, selectedProduct.y);

            // Центрируем карту на категории товара
            map.setView(leafletPos, 1, {
                animate: true,
                duration: 0.5
            });

            // Находим маркер категории и открываем его popup
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getLatLng) {
                    const pos = layer.getLatLng();
                    if (Math.abs(pos.lat - leafletPos.lat) < 1 && Math.abs(pos.lng - leafletPos.lng) < 1) {
                        // Анимированное открытие popup с задержкой
                        setTimeout(() => {
                            layer.openPopup();
                        }, 500);
                    }
                }
            });
        }
    }, [selectedProduct, map]);

    // Обработка результатов AI - подсветка множественных категорий
    useEffect(() => {
        if (aiCategories && aiCategories.length > 0) {
            // Массив координат всех найденных категорий
            const categoryCoords = [];

            aiCategories.forEach((cat) => {
                if (cat.x_coordinate && cat.y_coordinate) {
                    const leafletPos = adminToLeaflet(cat.x_coordinate, cat.y_coordinate);
                    categoryCoords.push(leafletPos);
                }
            });

            if (categoryCoords.length > 0) {
                // Центрируем карту на все найденные категории
                const bounds = L.latLngBounds(categoryCoords);
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 1,
                    animate: true,
                    duration: 0.5
                });

                // Подсвечиваем маркеры найденных категорий
                setTimeout(() => {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.getLatLng) {
                            const pos = layer.getLatLng();

                            // Проверяем, является ли этот маркер одной из найденных категорий
                            const isAICategory = categoryCoords.some(coord =>
                                Math.abs(pos.lat - coord.lat) < 1 && Math.abs(pos.lng - coord.lng) < 1
                            );

                            if (isAICategory) {
                                // Добавляем пульсирующий эффект
                                const element = layer.getElement();
                                if (element) {
                                    element.classList.add('ai-highlighted');
                                    element.style.animation = 'pulse 1.5s ease-in-out infinite';
                                }
                            }
                        }
                    });
                }, 500);
            }
        }
    }, [aiCategories, map]);

    return null;
}