import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { SetupMap } from "./SetupMap";
import { ShowAllCategories } from "./ShowAllCategories";
import { CategorySearch } from "./CategorySearch";
import { CommoditySearch } from "./CommoditySearch";
import { MultiCommoditySearch } from "./MultiCommoditySearch";
import { DirectRouteBuilder } from "./DirectRouteBuilder";
import { OBSTACLE_MAP, loadObstaclesForShop } from "./ObstacleMap";
import { adminToLeaflet } from "../../../Utils/coordinateUtils";

delete L.Icon.Default.prototype._getIconUrl;

export default function MapImage({
    shopId,
    shop,
    mapImageUrl,
    isBuildRouteClicked,
    categories,
    source,
    destination,
    postBuildRoute,
    searchedCategory,
    searchedCategoryByCommodity,
    multiSearch,
    selectedCategory,
    selectedProduct,
    aiCategories,
    onBuildRoute,
    onRouteReset,
    onRouteInfo,
}) {
    const map = useMap();
    const routeBuilderRef = useRef(null);
    const [obstaclesLoaded, setObstaclesLoaded] = useState(false);

    // Load obstacles from API when component mounts
    useEffect(() => {
        if (shopId) {
            loadObstaclesForShop(shopId).then(() => {
                setObstaclesLoaded(true);
            });
        }
    }, [shopId]);

    // Initialize route builder
    useEffect(() => {
        if (!routeBuilderRef.current) {
            routeBuilderRef.current = new DirectRouteBuilder(map);
        }
        if (routeBuilderRef.current) {
            routeBuilderRef.current.onResetCallback = onRouteReset;
            routeBuilderRef.current.onRouteInfoCallback = onRouteInfo;
            routeBuilderRef.current.shopId = shopId;
        }
    }, [map, onRouteReset, onRouteInfo]);

    // Define list of active categories for filtering
    const activeCategoryIds = new Set();
    if (selectedCategory?.id) activeCategoryIds.add(selectedCategory.id);
    if (selectedProduct?.categoryId) activeCategoryIds.add(selectedProduct.categoryId);

    if (aiCategories && aiCategories.length > 0) {
        aiCategories.forEach(cat => {
            if (cat.id) activeCategoryIds.add(cat.id);
            else if (cat.categoryId) activeCategoryIds.add(cat.categoryId);
        });
    }

    if (destination?.categoryId) activeCategoryIds.add(destination.categoryId);

    if (Array.isArray(source)) {
        source.forEach(wp => {
            if (wp.categoryId) activeCategoryIds.add(wp.categoryId);
        });
    } else if (source?.categoryId) {
        activeCategoryIds.add(source.categoryId);
    }

    // Show either filtered categories or all if nothing is selected
    const visibleCategories = activeCategoryIds.size > 0
        ? categories.filter(cat => activeCategoryIds.has(cat.id))
        : categories;

    // Category IDs that have route waypoint markers — hide their regular markers (Task 2)
    const routeCategoryIds = new Set();
    if (destination?.categoryId) routeCategoryIds.add(destination.categoryId);
    if (Array.isArray(source)) {
        source.forEach(wp => {
            if (wp.categoryId) routeCategoryIds.add(wp.categoryId);
        });
    }

    // Show categories with custom markers
    ShowAllCategories(map, visibleCategories, shop, aiCategories, routeCategoryIds, selectedCategory, selectedProduct);

    // CategorySearch(map, searchedCategory);
    CommoditySearch(map, searchedCategoryByCommodity);
    // MultiCommoditySearch(map, multiSearch);

    // Build route when source/destination coordinates are set
    useEffect(() => {
        if (routeBuilderRef.current) {
            // Multi-point route (array of waypoints)
            if (Array.isArray(source) && source.length > 0) {
                routeBuilderRef.current.buildRoute(source);
            }
            // Simple two-point route
            else if (source && destination && typeof source === 'object' && typeof destination === 'object') {
                routeBuilderRef.current.buildRoute(
                    { x: source.x, y: source.y },
                    { x: destination.x, y: destination.y, commodities: destination.commodities || [] },
                    source.name,
                    destination.name
                );
            }
            // Source reset — clear previous route
            else if (!source) {
                routeBuilderRef.current.clearRoute();
            }
        }
    }, [source, destination, map]);

    useEffect(() => {
        SetupMap(map, mapImageUrl, shop);
    }, [map, mapImageUrl]);

    useEffect(() => {
        if (!obstaclesLoaded) return;

        // Re-initialize route builder after obstacles are loaded
        if (routeBuilderRef.current) {
            routeBuilderRef.current.initializePathfinding();
        }
    }, [obstaclesLoaded, map]);

    // Handle clicks on "Build route" buttons in popup
    useEffect(() => {
        const handlePopupClick = (e) => {
            const button = e.target.closest('[data-action="build-route"]');
            if (button && onBuildRoute) {
                const categoryId = button.getAttribute('data-category-id');
                if (categoryId) {
                    onBuildRoute(parseInt(categoryId));
                }
            }
        };

        map.getContainer().addEventListener('click', handlePopupClick);

        return () => {
            map.getContainer().removeEventListener('click', handlePopupClick);
        };
    }, [map, onBuildRoute]);

    // Handle category selection from search - center and highlight
    useEffect(() => {
        if (selectedCategory) {
            // Convert admin coordinates to Leaflet coordinates
            const leafletPos = adminToLeaflet(selectedCategory.x, selectedCategory.y);

            // Center map on selected category
            map.setView(leafletPos, 1, {
                animate: true,
                duration: 0.5
            });

            // Find selected category marker and open its popup
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getLatLng) {
                    const pos = layer.getLatLng();
                    if (Math.abs(pos.lat - leafletPos.lat) < 1 && Math.abs(pos.lng - leafletPos.lng) < 1) {
                        // Animated popup opening with delay
                        setTimeout(() => {
                            layer.openPopup();
                        }, 500);
                    }
                }
            });
        }
    }, [selectedCategory, map]);

    // Handle product selection from search - center on product category
    useEffect(() => {
        if (selectedProduct && selectedProduct.x && selectedProduct.y) {
            // Convert admin coordinates to Leaflet coordinates
            const leafletPos = adminToLeaflet(selectedProduct.x, selectedProduct.y);

            // Center map on product category
            map.setView(leafletPos, 1, {
                animate: true,
                duration: 0.5
            });

            // Find category marker and open its popup
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getLatLng) {
                    const pos = layer.getLatLng();
                    if (Math.abs(pos.lat - leafletPos.lat) < 1 && Math.abs(pos.lng - leafletPos.lng) < 1) {
                        // Animated popup opening with delay
                        setTimeout(() => {
                            layer.openPopup();
                        }, 500);
                    }
                }
            });
        }
    }, [selectedProduct, map]);

    // Handle AI results - highlight multiple categories
    useEffect(() => {
        if (aiCategories && aiCategories.length > 0) {
            // Array of coordinates for all found categories
            const categoryCoords = [];

            aiCategories.forEach((cat) => {
                if (cat.x_coordinate && cat.y_coordinate) {
                    const leafletPos = adminToLeaflet(cat.x_coordinate, cat.y_coordinate);
                    categoryCoords.push(leafletPos);
                }
            });

            if (categoryCoords.length > 0) {
                // Center map on all found categories
                const bounds = L.latLngBounds(categoryCoords);
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 1,
                    animate: true,
                    duration: 0.5
                });

                // Highlight markers of found categories
                setTimeout(() => {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.getLatLng) {
                            const pos = layer.getLatLng();

                            // Check if this marker is one of the found categories
                            const isAICategory = categoryCoords.some(coord =>
                                Math.abs(pos.lat - coord.lat) < 1 && Math.abs(pos.lng - coord.lng) < 1
                            );

                            if (isAICategory) {
                                // Add pulsing effect
                                const element = layer.getElement();
                                if (element) {
                                    element.classList.add('ai-highlighted');
                                    element.style.animation = 'pulse 1.5s ease-in-out infinite';
                                }
                            }
                        }
                    });
                }, 500);
            }
        }
    }, [aiCategories, map]);

    return null;
}