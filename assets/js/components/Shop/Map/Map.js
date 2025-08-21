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
    multiSearch,
    height = 620
}) {
    return (
        <div style={{ height: height + 'px', width: '100%' }}>
            <MapContainer
                minZoom={-1}
                crs={CRS.Simple}
                maxBoundsViscosity={1}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: '100%', width: '100%' }}
            >
                <MapImage
                    isBuildRouteClicked={isBuildRouteClicked}
                    categories={categories}
                    source={source}
                    destination={destination}
                    postBuildRoute={postBuildRoute}
                    searchedCategory={searchedCategory}
                    searchedCategoryByCommodity={searchedCategoryByCommodity}
                    multiSearch={multiSearch}
                />
            </MapContainer>
        </div>
    )
}