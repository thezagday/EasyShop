import React, { useEffect, useState } from "react";
import {useMap} from "react-leaflet";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

let yx = L.latLng;
let xy = function(x, y) {
    if (Array.isArray(x)) {    // When doing xy([x, y]);
        return yx(x[1], x[0]);
    }
    return yx(y, x);  // When doing xy(x, y);
};
function SimpleGameImageOverlay({isBuildRoute, shopCategories}) {
    const map = useMap();
    const [route, setRoute] = useState(null);

    async function buildRoute() {
        try {
            const response = await fetch(`http://easy:8080/api/build-route`);
            const data = await response.json();
            console.log(data[0]);
            setRoute(data);

            return data[0];
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        const bounds = [[-30.68, -30.68], [1048.86, 1048.86]];
        const image = L.imageOverlay(
            "/img/map.png", // "https://leafletjs.com/examples/crs-simple/uqm_map_full.png",
            bounds
        ).addTo(map);

        map.fitBounds(image.getBounds());
        map.setMaxBounds(map.getBounds());

        addShopCategoriesToMapAndReturn(map, shopCategories);

        if (isBuildRoute) {
            buildRoute();
            addRoute(map, []);
        }
    }, [isBuildRoute, shopCategories]);

    return null;
}
function addShopCategoriesToMapAndReturn(map, shopCategories) {
    let categoryPoints = [];
    shopCategories.forEach(function(shopCategory) {
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
function addRoute(map, points) {
    let travel = L.polyline(points).addTo(map);
}

export default function MapImage({ isBuildRoute, shopCategories }) {
    return (
        <>
            <SimpleGameImageOverlay isBuildRoute={isBuildRoute} shopCategories={shopCategories} />
        </>
    )
}