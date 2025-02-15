import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function CommoditySearch(map, searchedCategoryByCommodity) {
    let markers = useRef([]);
    function removeAllMarkers() {
        if (markers.current != null) {
            markers.current.forEach(marker => {
                console.log('remove');
                map.removeLayer(marker);
            });
            markers.current = null;
        }
    }

    if (searchedCategoryByCommodity && searchedCategoryByCommodity.category) {
        let categoryPoint = xy(searchedCategoryByCommodity.x_coordinate, searchedCategoryByCommodity.y_coordinate);
        let marker = L.marker(categoryPoint).addTo(map);

        marker.bindPopup(searchedCategoryByCommodity.category.title, {autoClose: false, closeOnClick: false}).openPopup();
        markers.current.push({
            marker: marker,
            coordinates: categoryPoint
        });
    }

    if (markers.current.length > 0) {
        let allCoordinates = markers.current.map(item => item.coordinates);
        L.polyline(allCoordinates, {color: 'blue'}).addTo(map);
    }
}