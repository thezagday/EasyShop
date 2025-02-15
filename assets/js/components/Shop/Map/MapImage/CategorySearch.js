import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function CategorySearch(map, searchedCategory) {
    let markers = useRef([]);
    function removeAllMarkers() {
        if (markers.current != null) {
            markers.current.forEach(marker => {
                map.removeLayer(marker);
            });
            markers.current = null;
        }
    }

    if (searchedCategory && searchedCategory.category) {
        let categoryPoint = xy(searchedCategory.x_coordinate, searchedCategory.y_coordinate);
        let marker = L.marker(categoryPoint).addTo(map);

        marker.bindPopup(searchedCategory.category.title, {autoClose: false, closeOnClick: false}).openPopup();
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