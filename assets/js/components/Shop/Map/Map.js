import React from "react";
import "leaflet";
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer } from 'react-leaflet';
import MapImage from "./MapImage/MapImage";

export default function Map({
    isBuildRouteClicked,
    categories,
    source,
    destination,
    postBuildRoute,
    searchedCategory,
    searchedCategoryByCommodity,
}) {
    return (
            <MapContainer
                minZoom={0}
                crs={CRS.Simple}
                maxBoundsViscosity={1}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: "110vh" }}
            >
                <MapImage
                    isBuildRouteClicked={isBuildRouteClicked}
                    categories={categories}
                    source={source}
                    destination={destination}
                    postBuildRoute={postBuildRoute}
                    searchedCategory={searchedCategory}
                    searchedCategoryByCommodity={searchedCategoryByCommodity}
                />
            </MapContainer>
    )
}