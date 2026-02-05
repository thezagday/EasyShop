import { useMap } from "react-leaflet";
import L from "leaflet";
import {useEffect, useRef, useState} from "react";
import {SetupMap} from "./SetupMap";
import {ShowAllCategories} from "./ShowAllCategories";
import {CategorySearch} from "./CategorySearch";
import {CommoditySearch} from "./CommoditySearch";
import {MultiCommoditySearch} from "./MultiCommoditySearch";
import {DirectRouteBuilder} from "./DirectRouteBuilder";
import {visualizeObstacles, OBSTACLE_MAP, loadObstaclesForShop} from "./ObstacleMap";

delete L.Icon.Default.prototype._getIconUrl;

export default function MapImage({
    shopId,
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
    }, [map]);

    // Показываем все категории с кастомными маркерами при загрузке
    ShowAllCategories(map, categories);
    
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
        }
    }, [source, destination, map]);

    useEffect(() => {
        SetupMap(map, mapImageUrl);
    }, [map, mapImageUrl]);

    useEffect(() => {
        if (!obstaclesLoaded) return;

        // Re-initialize route builder after obstacles are loaded
        if (routeBuilderRef.current) {
            routeBuilderRef.current.initializePathfinding();
        }

        // Визуализация препятствий в режиме отладки
        if (OBSTACLE_MAP.debugMode) {
            visualizeObstacles(map);
            console.log('🔴 Obstacle visualization enabled - red rectangles show obstacles');
            console.log('📍 Obstacles:', OBSTACLE_MAP.obstacles);
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
            // Центрируем карту на выбранной категории
            map.setView([selectedCategory.y, selectedCategory.x], 1, {
                animate: true,
                duration: 0.5
            });

            // Находим маркер выбранной категории и открываем его popup
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getLatLng) {
                    const pos = layer.getLatLng();
                    if (Math.abs(pos.lat - selectedCategory.y) < 1 && Math.abs(pos.lng - selectedCategory.x) < 1) {
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
            // Центрируем карту на категории товара
            map.setView([selectedProduct.y, selectedProduct.x], 1, {
                animate: true,
                duration: 0.5
            });

            // Находим маркер категории и открываем его popup
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getLatLng) {
                    const pos = layer.getLatLng();
                    if (Math.abs(pos.lat - selectedProduct.y) < 1 && Math.abs(pos.lng - selectedProduct.x) < 1) {
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
                    categoryCoords.push([cat.y_coordinate, cat.x_coordinate]);
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
                                Math.abs(pos.lat - coord[0]) < 1 && Math.abs(pos.lng - coord[1]) < 1
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