import React, { useEffect } from "react";
import "leaflet";
import L, { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, useMap } from 'react-leaflet';

function SimpleImageOverlay() {
    const map = useMap();

    useEffect(() => {
        const bounds = [[-26.5, -25], [1021.5, 1023]];
        const image = L.imageOverlay(
            "https://i.imgur.com/Ion6X7C.jpg",
            bounds
        ).addTo(map);

        map.fitBounds(image.getBounds());
    }, []);

    return null;
}

function Map() {
    return (
        <div>
            <MapContainer
                minZoom={0}
                crs={CRS.Simple}
                maxBoundsViscosity={1.0}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: "100vh" }}
            >
                <SimpleImageOverlay />
            </MapContainer>
        </div>
    )
}

export default Map;