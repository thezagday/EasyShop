import { useMap } from "react-leaflet";
import L from "leaflet";
import {useEffect, useState} from "react";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default function MapImage({
    isBuildRouteClicked,
    categories,
    source,
    destination,
    afterClick
}) {
    const map = useMap();

    const bounds = [[-30.68, -30.68], [1048.86, 1048.86]];
    const image = L.imageOverlay("/img/map.png", bounds).addTo(map);

    const [route, setRoute] = useState(null);

    let yx = L.latLng;
    let xy = function(x, y) {
        if (Array.isArray(x)) {    // When doing xy([x, y]);
            return yx(x[1], x[0]);
        }
        return yx(y, x);  // When doing xy(x, y);
    };

    function addShopCategoriesToMapAndReturn(map, categories) {
        let categoryPoints = [];
        categories.forEach(function(shopCategory) {
            if (shopCategory.id == 17 || shopCategory.id == 18) {
                return;
            }
            let categoryPoint = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
            L.marker(categoryPoint).addTo(map).bindTooltip(shopCategory.category.title);

            categoryPoints.push(categoryPoint);
        });

        let start = [0, 250];
        L.marker(start).addTo(map).bindTooltip('Вход');
        categoryPoints.push(start);

        let finish = [0, 750];
        L.marker(finish).addTo(map).bindTooltip('Выход');
        categoryPoints.push(finish);

        return categoryPoints;
    }

    async function buildRoute() {
        try {
            let response = await fetch(`http://easy:8080/api/build-route/${source}/${destination}`);
            let data = await response.json();

            if (route != null) {
                map.removeLayer(route);
            }

            addRoute(map, data);
            afterClick();
        } catch (error) {
            console.error(error);
        }
    }

    function addRoute(map, categories) {
        let pointsToMap = [];
        categories.forEach(function(category) {
            pointsToMap.push(xy(category.x_coordinate, category.y_coordinate));
        });

        let travel = L.polyline(pointsToMap).addTo(map);

        setRoute(travel);
    }

    useEffect(() => {
        if (isBuildRouteClicked) {
            buildRoute();
        }
    }, [isBuildRouteClicked]);

    map.fitBounds(image.getBounds());
    map.setMaxBounds(map.getBounds());

    addShopCategoriesToMapAndReturn(map, categories);

    return null;
}