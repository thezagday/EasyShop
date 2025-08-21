import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function CommoditySearch(map, searchedCategoryByCommodity) {
    let markers = useRef([]);
    function removeAllMarkers() {
        if (markers.current) {
            markers.current.forEach(marker => {
                map.removeLayer(marker.marker);
            });
            markers.current = [];
        }
    }

    removeAllMarkers();

    if (Array.isArray(searchedCategoryByCommodity)) {
        searchedCategoryByCommodity.forEach(categoryData => {
            const categoryPoint = xy(categoryData.x_coordinate, categoryData.y_coordinate);
            const marker = L.marker(categoryPoint).addTo(map);
            marker.bindPopup(categoryData.title, {
                autoClose: false, closeOnClick: false
            }).openPopup();
            markers.current.push({
                marker: marker,
                coordinates: categoryPoint
            });
        });
    } else if (searchedCategoryByCommodity && searchedCategoryByCommodity.x_coordinate !== undefined) {
        const categoryPoint = xy(
            searchedCategoryByCommodity.x_coordinate,
            searchedCategoryByCommodity.y_coordinate
        );
        const marker = L.marker(categoryPoint).addTo(map);
        marker.bindPopup(
            searchedCategoryByCommodity.title ?? searchedCategoryByCommodity.category.title,
            { autoClose: false, closeOnClick: false }
        ).openPopup();
        markers.current.push({
            marker: marker,
            coordinates: categoryPoint
        });
    }

    if (markers.current && markers.current.length > 0) {
        const allCoordinates = markers.current.map(item => item.coordinates);
        L.polyline(allCoordinates, {color: 'blue'}).addTo(map);
    }
}