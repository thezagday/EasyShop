import React from "react";
import "leaflet";
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet';
import MapImage from "./MapImage";

export default function Map({ buildRouteClicked, shopCategories }) {
    return (
        <div className="col-xl-8 col-lg-7 col-md-6 col-sm-12">
            <MapContainer
                minZoom={0}
                crs={CRS.Simple}
                maxBoundsViscosity={1}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: "120vh" }}
            >
                <MapImage isBuildRoute={buildRouteClicked} shopCategories={shopCategories} />
            </MapContainer>
        </div>
    )
}