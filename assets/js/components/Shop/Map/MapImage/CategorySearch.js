import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function CategorySearch(map, searchedCategory) {
    let markers = useRef(null);
    function removeAllMarkers() {
        if (markers.current != null) {
            markers.current.forEach(marker => {
                console.log('remove');
                map.removeLayer(marker);
            });
            markers.current = null;
        }
    }

    removeAllMarkers();

    let tempMarkers = [];

    if (searchedCategory && searchedCategory.category) {
        let categoryPoint = xy(searchedCategory.x_coordinate, searchedCategory.y_coordinate);
        let marker = L.marker(categoryPoint).addTo(map).bindTooltip(searchedCategory.category.title).openTooltip();
        tempMarkers.push(marker);
    }

    markers.current = tempMarkers;
}