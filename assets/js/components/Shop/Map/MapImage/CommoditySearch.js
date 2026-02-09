import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function CommoditySearch(map, searchedCategoryByCommodity) {
    let markers = useRef([]);
    let circles = useRef([]);
    let polylines = useRef([]);
    
    function removeAllMarkers() {
        if (markers.current) {
            markers.current.forEach(marker => {
                map.removeLayer(marker.marker);
            });
            markers.current = [];
        }
        if (circles.current) {
            circles.current.forEach(circle => {
                map.removeLayer(circle);
            });
            circles.current = [];
        }
        if (polylines.current) {
            polylines.current.forEach(polyline => {
                map.removeLayer(polyline);
            });
            polylines.current = [];
        }
    }

    removeAllMarkers();

    if (Array.isArray(searchedCategoryByCommodity)) {
        searchedCategoryByCommodity.forEach(categoryData => {
            const categoryPoint = xy(categoryData.x_coordinate, categoryData.y_coordinate);
            
            // Добавляем зеленый пульсирующий круг для выделения найденной категории
            const circle = L.circle(categoryPoint, {
                color: '#00ff00',
                fillColor: '#00ff00',
                fillOpacity: 0.2,
                radius: 30,
                weight: 3,
                className: 'pulsating-circle'
            }).addTo(map);
            circles.current.push(circle);
            
            const marker = L.marker(categoryPoint, {
                icon: L.divIcon({
                    className: 'custom-marker-wrapper',
                    html: '<div class="custom-shop-marker"><div class="icon">🛒</div></div>',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40]
                })
            }).addTo(map);
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
        
        // Добавляем зеленый пульсирующий круг для выделения найденной категории
        const circle = L.circle(categoryPoint, {
            color: '#00ff00',
            fillColor: '#00ff00',
            fillOpacity: 0.2,
            radius: 30,
            weight: 3,
            className: 'pulsating-circle'
        }).addTo(map);
        circles.current.push(circle);
        
        const marker = L.marker(categoryPoint, {
            icon: L.divIcon({
                className: 'custom-marker-wrapper',
                html: '<div class="custom-shop-marker"><div class="icon">🛒</div></div>',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            })
        }).addTo(map);
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
        const polyline = L.polyline(allCoordinates, {color: 'blue'});
        polyline.addTo(map);
        polylines.current.push(polyline);
    }
}