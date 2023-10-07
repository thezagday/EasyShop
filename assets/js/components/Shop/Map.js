import React, { useEffect } from "react";
import "leaflet";
import L, { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, useMap } from 'react-leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function SimpleGameImageOverlay({isBuildRoute, shopCategories}) {
    const map = useMap();

    useEffect(() => {
        const bounds = [[-26.5, -25], [1021.5, 1023]];
        const image = L.imageOverlay(
            "https://leafletjs.com/examples/crs-simple/uqm_map_full.png",
            bounds
        ).addTo(map);

        map.fitBounds(image.getBounds());

        let shops = addShopCategoriesToMapAndReturn(map, shopCategories);

        if (isBuildRoute) {
            addTestRoute(map, shops);
        }
    }, [isBuildRoute, shopCategories]);

    return null;
}
let yx = L.latLng;
let xy = function(x, y) {
    if (Array.isArray(x)) {    // When doing xy([x, y]);
        return yx(x[1], x[0]);
    }
    return yx(y, x);  // When doing xy(x, y);
};
function addShopCategoriesToMapAndReturn(map, shopCategories) {
    let shops = [];
    shopCategories.forEach(function(shopCategory) {
        let shop = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
        L.marker(shop).addTo(map).bindTooltip(shopCategory.category.title);
        shops.push(shop);
    });

    return shops;
}

function addTestRoute(map, shops) {
    let travel = L.polyline(shops).addTo(map);
}

function Map({ buildRouteClicked, shopCategories }) {
    return (
        <div className="col-xl-8 col-lg-7 col-md-6 col-sm-12">
            <MapContainer
                minZoom={0}
                crs={CRS.Simple}
                maxBoundsViscosity={1.0}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: "100vh" }}
            >
                <SimpleGameImageOverlay isBuildRoute={buildRouteClicked} shopCategories={shopCategories} />
            </MapContainer>
        </div>
    )
}

export default Map;