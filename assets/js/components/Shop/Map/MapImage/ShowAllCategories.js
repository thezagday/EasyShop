import L from "leaflet";
import {useRef} from "react";
import {xy} from "../../../Utils/coordinateUtils"

export function ShowAllCategories(map, categories) {
    let markers = useRef([]);
    
    function removeAllMarkers() {
        if (markers.current) {
            markers.current.forEach(marker => {
                map.removeLayer(marker);
            });
            markers.current = [];
        }
    }

    removeAllMarkers();

    // Создаем красную иконку для маркеров
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(categoryData => {
            if (categoryData.x_coordinate !== undefined && categoryData.y_coordinate !== undefined) {
                const categoryPoint = xy(categoryData.x_coordinate, categoryData.y_coordinate);
                const marker = L.marker(categoryPoint, { icon: redIcon }).addTo(map);
                
                const title = categoryData.title || categoryData.category?.title || 'Категория';
                marker.bindPopup(title, {
                    autoClose: false,
                    closeOnClick: false
                });
                
                markers.current.push(marker);
            }
        });
    }
}
