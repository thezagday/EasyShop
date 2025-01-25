import {useEffect, useRef} from "react";
import L from "leaflet";
import {xy} from "../../../Utils/coordinateUtils"

export function CategoryRouteGeneration(map, isBuildRouteClicked, categories, source, destination, postBuildRoute) {
    let routeRef = useRef(null);

    function addShopCategoriesToMapAndReturn(map, categories) {
        let categoryPoints = [];
        categories.forEach(function (shopCategory) {
            let categoryPoint = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
            L.marker(categoryPoint).addTo(map).bindTooltip(shopCategory.category.title);

            categoryPoints.push(categoryPoint);
        });

        let start = [0, 50];
        L.marker(start).addTo(map).bindTooltip('Вход');
        categoryPoints.push(start);

        let finish = [0, 200];
        L.marker(finish).addTo(map).bindTooltip('Выход');
        categoryPoints.push(finish);

        return categoryPoints;
    }

    function preBuildRoute() {
        if (routeRef.current != null) {
            map.removeLayer(routeRef.current);
        }
    }

    async function buildRoute() {
        try {
            let response = await fetch(`http://easy:8080/api/build-route/${source}/${destination}`);
            let data = await response.json();

            appendRouteToMap(map, data);
        } catch (error) {
            console.error(error);
        }
    }

    function appendRouteToMap(map, categories) {
        let pointsToMap = [];
        categories.forEach(function (category) {
            pointsToMap.push(xy(category.x_coordinate, category.y_coordinate));
        });

        let travel = L.polyline(pointsToMap).addTo(map);

        handleAppendRoute(travel);
    }

    function handleAppendRoute(route) {
        routeRef.current = route;
    }

    useEffect(() => {
        if (isBuildRouteClicked) {
            preBuildRoute();
            buildRoute();
        }
        return () => postBuildRoute();
    }, [isBuildRouteClicked]);

    addShopCategoriesToMapAndReturn(map, categories);
}