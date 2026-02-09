import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function MultiCommoditySearch(map, multiSearch) {
    let markers = useRef([]);
    function removeAllMarkers() {
        if (markers.current != null) {
            markers.current.forEach(marker => {
                map.removeLayer(marker);
            });
            markers.current = null;
        }
    }

    multiSearch.forEach(function (shopCategory) {
        let categoryPoint = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
        let marker = L.marker(categoryPoint, {
            icon: L.divIcon({
                className: 'custom-marker-wrapper',
                html: '<div class="custom-shop-marker"><div class="icon">🛒</div></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            })
        }).addTo(map);

        marker.bindPopup(shopCategory.category.title, {autoClose: false, closeOnClick: false}).openPopup();
        markers.current.push({
            marker: marker,
            coordinates: categoryPoint
        });

        if (markers.current.length > 0) {
            let allCoordinates = markers.current.map(item => item.coordinates);
            L.polyline(allCoordinates, {color: 'blue'}).addTo(map);
        }
    });
}