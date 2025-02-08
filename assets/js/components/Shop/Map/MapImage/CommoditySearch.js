import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function CommoditySearch(map, searchedCategoryByCommodity) {
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

    if (searchedCategoryByCommodity && searchedCategoryByCommodity.category) {
        let categoryPoint = xy(searchedCategoryByCommodity.x_coordinate, searchedCategoryByCommodity.y_coordinate);
        let marker = L.marker(categoryPoint).addTo(map).bindTooltip(searchedCategoryByCommodity.category.title).openTooltip();
        tempMarkers.push(marker);
    }

    // searchedCommodities.forEach(function (commodity) {
        // if (commodity.title == 'Рыба свежемороженая') {
        //     let categoryPoint = xy(100, 100);
        //     let marker = L.marker(categoryPoint).addTo(map).bindTooltip(commodity.title).openTooltip();
        //
        //     tempMarkers.push(marker);
        // }
        //
        // if (commodity.title == 'Рыба охлажденная') {
        //     let categoryPoint = xy(200, 200);
        //     let marker = L.marker(categoryPoint).addTo(map).bindTooltip(commodity.title).openTooltip();
        //
        //     tempMarkers.push(marker);
        // }
        //
        // if (commodity.title == 'Рыба соленая') {
        //     let categoryPoint = xy(300, 300);
        //     let marker = L.marker(categoryPoint).addTo(map).bindTooltip(commodity.title).openTooltip();
        //
        //     tempMarkers.push(marker);
        // }
        //
        // if (commodity.title == 'Рыба копченая') {
        //     let categoryPoint = xy(400, 400);
        //     let marker = L.marker(categoryPoint).addTo(map).bindTooltip(commodity.title).openTooltip();
        //
        //     tempMarkers.push(marker);
        // }
        //
        // if (commodity.title == 'Рыбные снеки, рыба вяленая, сушеная') {
        //     let categoryPoint = xy(500, 500);
        //     let marker = L.marker(categoryPoint).addTo(map).bindTooltip(commodity.title).openTooltip();
        //
        //     tempMarkers.push(marker);
        // }
        //
        // if (commodity.title == 'Рыба свежемороженая') {
        //     let categoryPoint = xy(600, 600);
        //     let marker = L.marker(categoryPoint).addTo(map).bindTooltip(commodity.title).openTooltip();
        //
        //     tempMarkers.push(marker);
        // }
    // });

    markers.current = tempMarkers;
}