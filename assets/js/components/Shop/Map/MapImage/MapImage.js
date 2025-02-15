import { useMap } from "react-leaflet";
import L from "leaflet";
import {useEffect, useRef} from "react";
import {SetupMap} from "./SetupMap";
import {CategorySearch} from "./CategorySearch";
import {CategoryRouteGeneration} from "./CategoryRouteGeneration";
import {CommoditySearch} from "./CommoditySearch";
import {MultiCommoditySearch} from "./MultiCommoditySearch";
delete L.Icon.Default.prototype._getIconUrl;

export default function MapImage({
    isBuildRouteClicked,
    categories,
    source,
    destination,
    postBuildRoute,
    searchedCategory,
    searchedCategoryByCommodity,
    multiSearch,
}) {
    const map = useMap();

    CategorySearch(map, searchedCategory);
    CommoditySearch(map, searchedCategoryByCommodity);
    MultiCommoditySearch(map, multiSearch);
    // CategoryRouteGeneration(map, isBuildRouteClicked, categories, source, destination, postBuildRoute);

    useEffect(() => {
        SetupMap(map);
    }, [map]);

    return null;
}