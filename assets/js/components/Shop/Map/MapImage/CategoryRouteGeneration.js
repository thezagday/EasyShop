import {useEffect, useRef} from "react";
import L from "leaflet";
import i18n from "../../../../i18n";
import {xy} from "../../../Utils/coordinateUtils";
import { CustomMarker } from "./CustomMarker";
import { AnimatedRoute } from "./AnimatedRoute";

export function CategoryRouteGeneration(map, isBuildRouteClicked, categories, source, destination, postBuildRoute) {
    let routeRef = useRef(null);
    let animatedRouteRef = useRef(null);
    let markersRef = useRef([]);

    function addShopCategoriesToMapAndReturn(map, categories) {
        let categoryPoints = [];
        
        // Clear old markers
        markersRef.current.forEach(marker => map.removeLayer(marker));
        markersRef.current = [];

        categories.forEach(function (shopCategory) {
            let categoryPoint = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
            
            // Use custom marker with categoryId
            const marker = CustomMarker.createShopMarker(
                categoryPoint,
                shopCategory.category.title,
                shopCategory.category.parent?.title || i18n.t('search.general'),
                shopCategory.id
            );
            
            marker.addTo(map);
            markersRef.current.push(marker);
            categoryPoints.push(categoryPoint);
        });

        // Add beautiful entrance and exit markers
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
            // Show loading indicator
            const loadingDiv = L.DomUtil.create('div', 'route-loading');
            loadingDiv.innerHTML = `
                <div class="spinner"></div>
                <span>${i18n.t('shop.building_route')}</span>
            `;
            map.getContainer().appendChild(loadingDiv);

            let response = await fetch(`/api/build-route/${source}/${destination}`);
            let data = await response.json();

            // Remove loading indicator
            map.getContainer().removeChild(loadingDiv);

            appendRouteToMap(map, data);
        } catch (error) {
            console.error('Route building error:', error);
            
            // Remove loading indicator on error
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

        // Create animated route
        if (!animatedRouteRef.current) {
            animatedRouteRef.current = new AnimatedRoute(map);
        }

        // Define start and end markers
        const startMarker = CustomMarker.createCurrentLocationMarker(pointsToMap[0]);
        const endMarker = CustomMarker.createShopMarker(
            pointsToMap[pointsToMap.length - 1],
            i18n.t('shop.destination'),
            i18n.t('shop.target')
        );

        const route = animatedRouteRef.current.drawAnimatedRoute(
            pointsToMap,
            startMarker,
            endMarker
        );

        // Show info panel
        showRouteInfo(pointsToMap);

        handleAppendRoute(route);
    }

    function showRouteInfo(points) {
        // Calculate approximate distance and time
        let distance = 0;
        for (let i = 1; i < points.length; i++) {
            const dy = points[i][0] - points[i-1][0];
            const dx = points[i][1] - points[i-1][1];
            distance += Math.sqrt(dx * dx + dy * dy);
        }
        
        const distanceInMeters = Math.round(distance * 0.1);
        const timeInMinutes = Math.ceil(distanceInMeters / 80); // ~80m/min average speed

        const infoPanel = L.DomUtil.create('div', 'route-info-panel');
        infoPanel.innerHTML = `
            <div class="route-info-item">
                <div class="route-info-label">${i18n.t('shop.distance')}</div>
                <div class="route-info-value">${distanceInMeters}m</div>
            </div>
            <div class="route-info-item">
                <div class="route-info-label">${i18n.t('shop.time')}</div>
                <div class="route-info-value">~${timeInMinutes} min</div>
            </div>
            <div class="route-info-item">
                <div class="route-info-label">${i18n.t('shop.points')}</div>
                <div class="route-info-value">${points.length}</div>
            </div>
        `;
        
        // Remove old panel if exists
        const oldPanel = map.getContainer().querySelector('.route-info-panel');
        if (oldPanel) {
            map.getContainer().removeChild(oldPanel);
        }
        
        map.getContainer().appendChild(infoPanel);
        
        // Automatically remove panel after 10 seconds
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
            
            // Cleanup on unmount
            const infoPanel = map.getContainer().querySelector('.route-info-panel');
            if (infoPanel) {
                map.getContainer().removeChild(infoPanel);
            }
        };
    }, [isBuildRouteClicked]);

    addShopCategoriesToMapAndReturn(map, categories);
}