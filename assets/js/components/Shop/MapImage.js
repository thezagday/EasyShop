import { useMap } from "react-leaflet";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default function MapImage({ isBuildRouteClicked, categories }) {
    const map = useMap();

    const bounds = [[-30.68, -30.68], [1048.86, 1048.86]];
    const image = L.imageOverlay("/img/map.png", bounds).addTo(map);

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
        const response = await fetch(`http://easy:8080/api/build-route`);
        const data = await response.json();

        return data[0];
    }

    function addRoute(map, points) {
        console.log(points);
        // TODO: To be fixed
        points = [];
        let travel = L.polyline(points).addTo(map);
    }

    map.fitBounds(image.getBounds());
    map.setMaxBounds(map.getBounds());

    addShopCategoriesToMapAndReturn(map, categories);

    if (isBuildRouteClicked) {
        addRoute(map, buildRoute());
    }

    return null;
}