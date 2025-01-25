import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../Utils/coordinateUtils"

export function CategorySearch(map, searchedCategories) {
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
    searchedCategories.forEach(function (shopCategory) {
        let categoryPoint = xy(shopCategory.x_coordinate, shopCategory.y_coordinate);
        let marker = L.marker(categoryPoint).addTo(map).bindTooltip(shopCategory.category.title).openTooltip();

        tempMarkers.push(marker);
    });

    markers.current = tempMarkers;
}