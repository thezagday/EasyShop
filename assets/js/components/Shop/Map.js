import React, { useEffect } from "react";
import "leaflet";
import L, { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, useMap } from 'react-leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function addTestRoute(map) {
    let yx = L.latLng;
    let xy = function(x, y) {
        if (Array.isArray(x)) {    // When doing xy([x, y]);
            return yx(x[1], x[0]);
        }
        return yx(y, x);  // When doing xy(x, y);
    };

    let sol      = xy(175.2, 145.0);
    let mizar    = xy( 41.6, 130.1);
    let kruegerZ = xy( 13.4,  56.5);
    let deneb    = xy(218.7,   8.3);

    L.marker(sol).addTo(map).bindPopup('Sol');
    L.marker(mizar).addTo(map).bindPopup('Mizar');
    L.marker(kruegerZ).addTo(map).bindPopup('Krueger-Z');
    L.marker(deneb).addTo(map).bindPopup('Deneb');

    let travel = L.polyline([sol, deneb, mizar, kruegerZ]).addTo(map);
}

function SimpleGameImageOverlay({isBuildRoute}) {
    const map = useMap();

    useEffect(() => {
        const bounds = [[-26.5, -25], [1021.5, 1023]];
        const image = L.imageOverlay(
            "https://leafletjs.com/examples/crs-simple/uqm_map_full.png",
            bounds
        ).addTo(map);

        map.fitBounds(image.getBounds());

        if (isBuildRoute) {
            addTestRoute(map);
        }
    }, [isBuildRoute]);

    return null;
}

function Map({ buildRouteClicked }) {
    return (
        <div>
            <MapContainer
                minZoom={0}
                crs={CRS.Simple}
                maxBoundsViscosity={1.0}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: "100vh" }}
            >
                <SimpleGameImageOverlay isBuildRoute={buildRouteClicked} />
            </MapContainer>
        </div>
    )
}

export default Map;