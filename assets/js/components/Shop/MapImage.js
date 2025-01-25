import { useMap } from "react-leaflet";
import L from "leaflet";
import {useEffect, useRef} from "react";
import {SetupMap} from "./Map/SetupMap";
import {CategorySearch} from "./Map/CategorySearch";
import {CategoryRouteGeneration} from "./Map/CategoryRouteGeneration";
delete L.Icon.Default.prototype._getIconUrl;

export default function MapImage({
    isBuildRouteClicked,
    categories,
    source,
    destination,
    postBuildRoute,
    searchedCategories,
}) {
    const map = useMap();

    CategorySearch(map, searchedCategories);
    CategoryRouteGeneration(map, isBuildRouteClicked, categories, source, destination, postBuildRoute);

    useEffect(() => {
        SetupMap(map);
    }, [map]);

    return null;
}