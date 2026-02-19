import React, { useState, useEffect } from "react";
import "leaflet";
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, useMap } from 'react-leaflet';
import MapImage from "./MapImage/MapImage";
import { UnifiedSearchControl } from "./MapControls/UnifiedSearchControl";
import { ZoomControl } from "./MapControls/ZoomControl";

function MapZoomControl() {
    const map = useMap();
    return <ZoomControl map={map} />;
}

export default function Map({
    shopId,
    shop,
    isBuildRouteClicked,
    categories,
    source,
    destination,
    postBuildRoute,
    searchedCategory,
    searchedCategoryByCommodity,
    multiSearch,
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [aiCategories, setAICategories] = useState([]);
    const [routeSource, setRouteSource] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);
    const [entranceExit, setEntranceExit] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {
        if (!shopId) return;
        fetch(`/api/shops/${shopId}/entrance-exit`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setEntranceExit(data); })
            .catch(() => {});
    }, [shopId]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSelectedProduct(null);
        setAICategories([]);
        console.log('Selected category:', category);
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSelectedCategory(null);
        setAICategories([]);
        console.log('Selected product:', product);
    };

    const handleAIResult = (result) => {
        setAICategories(result.categories || []);
        setSelectedCategory(null);
        setSelectedProduct(null);

        // If buildRoute flag is set, build multi-point route
        if (result.buildRoute && result.categories && result.categories.length > 0) {
            buildAIRoute(result.categories);
        } else {
            // Clear any existing route when AI highlights new categories (Task 3)
            setRouteSource(null);
            setRouteDestination(null);
            setRouteInfo(null);
        }

        console.log('AI result:', result);
    };

    const buildAIRoute = (categories) => {
        if (!categories || categories.length === 0) return;

        // Build multi-point route: Entrance → Category1 → Category2 → ... → Exit
        const entranceX = entranceExit?.entranceX ?? 0;
        const entranceY = entranceExit?.entranceY ?? 0;
        const exitX = entranceExit?.exitX ?? 0;
        const exitY = entranceExit?.exitY ?? 0;

        const waypoints = [
            { name: 'Вход', x: entranceX, y: entranceY },
            ...categories.map(cat => ({
                name: cat.title || cat.category?.title || 'Категория',
                x: cat.x_coordinate,
                y: cat.y_coordinate,
                categoryId: cat.id,
                commodities: cat.commodities || []
            })),
            { name: 'Выход', x: exitX, y: exitY }
        ];

        setRouteSource(waypoints);
        setRouteDestination(null); // Signal for multi-point route
    };

    const handleCollectionSelect = (collection) => {
        if (!collection.items || collection.items.length === 0) return;

        // Reset everything first
        setRouteSource(null);
        setRouteDestination(null);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setAICategories([]);

        // Group items by categoryId to build waypoints with commodity lists
        const categoryMap = new window.Map();
        collection.items.forEach(item => {
            if (!item.categoryId || !item.x || !item.y) return;
            if (!categoryMap.has(item.categoryId)) {
                categoryMap.set(item.categoryId, {
                    id: item.categoryId,
                    title: item.categoryTitle,
                    x_coordinate: item.x,
                    y_coordinate: item.y,
                    commodities: []
                });
            }
            categoryMap.get(item.categoryId).commodities.push(item.commodityTitle);
        });

        const cats = Array.from(categoryMap.values());

        // Build route on next tick so React processes the reset first
        setTimeout(() => {
            buildAIRoute(cats);
        }, 50);
    };

    const handleRouteReset = () => {
        setRouteSource(null);
        setRouteDestination(null);
        setAICategories([]);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setRouteInfo(null);
    };

    const handleBuildRoute = (categoryId) => {
        // Find category by ID
        const targetCategory = categories.find(cat => cat.id === categoryId);

        if (targetCategory) {
            // If a product was searched for this category, include it as commodity
            const commodities = [];
            if (selectedProduct && selectedProduct.categoryId === categoryId) {
                commodities.push(selectedProduct.name);
            }

            // Clear search state — route markers replace category markers
            setSelectedCategory(null);
            setSelectedProduct(null);

            // Pass actual coordinates for direct route drawing
            setRouteSource({
                name: 'Вход',
                x: shop?.entranceX ?? 0,
                y: shop?.entranceY ?? 50
            });
            setRouteDestination({
                name: targetCategory.category?.title || 'Категория',
                x: targetCategory.x_coordinate,
                y: targetCategory.y_coordinate,
                categoryId: categoryId,
                commodities: commodities
            });
        }
    };

    const shopName = shop?.title ? shop.title.split(' - ')[0] : '';
    const shopAddress = shop?.title && shop.title.includes(' - ') ? shop.title.split(' - ').slice(1).join(' - ') : '';

    return (
        <div className="map-wrapper">
            {/* Shop header bar */}
            {shop?.title && (
                <div className="shop-header-bar">
                    <span className="shop-header-name">{shopName}</span>
                    {shopAddress && (
                        <span className="shop-header-address">
                            <i className="fas fa-map-marker-alt shop-header-icon"></i>
                            {shopAddress}
                        </span>
                    )}
                </div>
            )}
            {/* Route info bar — above the map, not overlapping */}
            {routeInfo && (
                <div className="route-info-bar">
                    <span className="route-chip">🗺️ {routeInfo.from} → {routeInfo.to}</span>
                    <span className="route-chip">📏 ~{routeInfo.distance}м</span>
                    <span className="route-chip">⏱ ~{routeInfo.time} мин</span>
                    <button className="route-reset-btn" onClick={handleRouteReset}>✕</button>
                </div>
            )}

            <MapContainer
                minZoom={-1}
                crs={CRS.Simple}
                zoomSnap={0}
                zoomDelta={0.25}
                maxBoundsViscosity={1}
                boundsOptions={{ padding: [50, 50] }}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <MapImage
                    shopId={shopId}
                    shop={shop}
                    mapImageUrl={shop?.mapImage
                        ? `/img/${shop.mapImage}`
                        : '/img/map.svg'}
                    isBuildRouteClicked={isBuildRouteClicked}
                    categories={categories}
                    source={routeSource || source}
                    destination={routeDestination || destination}
                    postBuildRoute={postBuildRoute}
                    searchedCategory={searchedCategory}
                    searchedCategoryByCommodity={searchedCategoryByCommodity}
                    multiSearch={multiSearch}
                    selectedCategory={selectedCategory}
                    selectedProduct={selectedProduct}
                    aiCategories={aiCategories}
                    onBuildRoute={handleBuildRoute}
                    onRouteReset={handleRouteReset}
                    onRouteInfo={setRouteInfo}
                />
                <MapZoomControl />
            </MapContainer>

            {/* Bottom nav + sheets rendered outside MapContainer so they overlay the map */}
            <UnifiedSearchControl
                shopId={shopId}
                categories={categories}
                onCategorySelect={handleCategorySelect}
                onProductSelect={handleProductSelect}
                onAIResult={handleAIResult}
                onCollectionSelect={handleCollectionSelect}
            />
        </div>
    )
}