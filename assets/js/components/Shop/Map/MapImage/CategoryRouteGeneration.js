import {useEffect, useRef} from "react";
import L from "leaflet";
import {xy} from "../../../Utils/coordinateUtils";
import { CustomMarker } from "./CustomMarker";
import { AnimatedRoute } from "./AnimatedRoute";

export function CategoryRouteGeneration(map, isBuildRouteClicked, categories, source, destination, postBuildRoute) {
    let routeRef = useRef(null);
    let animatedRouteRef = useRef(null);
    let markersRef = useRef([]);

    function addShopCategoriesToMapAndReturn(map, categories) {
        let categoryPoints = [];
        
        // Очищаем старые маркеры
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];

        categories.forEach(function (shopCategory) {
            let categoryPoint = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
            
            // Используем кастомный маркер с categoryId
            const marker = CustomMarker.createShopMarker(
                categoryPoint,
                shopCategory.category.title,
                shopCategory.category.parent?.title || 'Общее',
                shopCategory.id
            );
            
            marker.addTo(map);
            markersRef.current.push(marker);
            categoryPoints.push(categoryPoint);
        });

        // Добавляем красивые маркеры входа и выхода
        let start = [0, 50];
        const entranceMarker = CustomMarker.createEntranceMarker(start);
        entranceMarker.addTo(map);
        markersRef.current.push(entranceMarker);
        categoryPoints.push(start);

        let finish = [0, 200];
        const exitMarker = CustomMarker.createExitMarker(finish);
        exitMarker.addTo(map);
        markersRef.current.push(exitMarker);
        categoryPoints.push(finish);

        return categoryPoints;
    }

    function preBuildRoute() {
        if (routeRef.current != null) {
            map.removeLayer(routeRef.current);
            routeRef.current = null;
        }
        
        if (animatedRouteRef.current != null) {
            animatedRouteRef.current.clearRoute();
            animatedRouteRef.current = null;
        }
    }

    async function buildRoute() {
        try {
            // Показываем индикатор загрузки
            const loadingDiv = L.DomUtil.create('div', 'route-loading');
            loadingDiv.innerHTML = `
                <div class="spinner"></div>
                <span>Построение маршрута...</span>
            `;
            map.getContainer().appendChild(loadingDiv);

            let response = await fetch(`/api/build-route/${source}/${destination}`);
            let data = await response.json();

            // Убираем индикатор загрузки
            map.getContainer().removeChild(loadingDiv);

            appendRouteToMap(map, data);
        } catch (error) {
            console.error('Route building error:', error);
            
            // Убираем индикатор загрузки при ошибке
            const loadingDiv = map.getContainer().querySelector('.route-loading');
            if (loadingDiv) {
                map.getContainer().removeChild(loadingDiv);
            }
        }
    }

    function appendRouteToMap(map, categories) {
        let pointsToMap = [];
        categories.forEach(function (category) {
            pointsToMap.push(xy(category.x_coordinate, category.y_coordinate));
        });

        if (pointsToMap.length < 2) {
            console.warn('Not enough points to build route');
            return;
        }

        // Создаем анимированный маршрут
        if (!animatedRouteRef.current) {
            animatedRouteRef.current = new AnimatedRoute(map);
        }

        // Определяем стартовый и конечный маркеры
        const startMarker = CustomMarker.createCurrentLocationMarker(pointsToMap[0]);
        const endMarker = CustomMarker.createShopMarker(
            pointsToMap[pointsToMap.length - 1],
            'Пункт назначения',
            'Цель'
        );

        const route = animatedRouteRef.current.drawAnimatedRoute(
            pointsToMap,
            startMarker,
            endMarker
        );

        // Показываем информационную панель
        showRouteInfo(pointsToMap);

        handleAppendRoute(route);
    }

    function showRouteInfo(points) {
        // Вычисляем примерное расстояние и время
        let distance = 0;
        for (let i = 1; i < points.length; i++) {
            const dy = points[i][0] - points[i-1][0];
            const dx = points[i][1] - points[i-1][1];
            distance += Math.sqrt(dx * dx + dy * dy);
        }
        
        const distanceInMeters = Math.round(distance * 0.1);
        const timeInMinutes = Math.ceil(distanceInMeters / 80); // ~80м/мин средняя скорость

        const infoPanel = L.DomUtil.create('div', 'route-info-panel');
        infoPanel.innerHTML = `
            <div class="route-info-item">
                <div class="route-info-label">Расстояние</div>
                <div class="route-info-value">${distanceInMeters}м</div>
            </div>
            <div class="route-info-item">
                <div class="route-info-label">Время</div>
                <div class="route-info-value">~${timeInMinutes} мин</div>
            </div>
            <div class="route-info-item">
                <div class="route-info-label">Точек</div>
                <div class="route-info-value">${points.length}</div>
            </div>
        `;
        
        // Удаляем старую панель если есть
        const oldPanel = map.getContainer().querySelector('.route-info-panel');
        if (oldPanel) {
            map.getContainer().removeChild(oldPanel);
        }
        
        map.getContainer().appendChild(infoPanel);
        
        // Автоматически убираем панель через 10 секунд
        setTimeout(() => {
            if (map.getContainer().contains(infoPanel)) {
                map.getContainer().removeChild(infoPanel);
            }
        }, 10000);
    }

    function handleAppendRoute(route) {
        routeRef.current = route;
    }

    useEffect(() => {
        if (isBuildRouteClicked) {
            preBuildRoute();
            buildRoute();
        }
        return () => {
            postBuildRoute();
            
            // Очистка при размонтировании
            const infoPanel = map.getContainer().querySelector('.route-info-panel');
            if (infoPanel) {
                map.getContainer().removeChild(infoPanel);
            }
        };
    }, [isBuildRouteClicked]);

    addShopCategoriesToMapAndReturn(map, categories);
}