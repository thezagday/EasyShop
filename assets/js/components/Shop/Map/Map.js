import React, { useState } from "react";
import "leaflet";
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, useMap } from 'react-leaflet';
import MapImage from "./MapImage/MapImage";
import { UnifiedSearchControl } from "./MapControls/UnifiedSearchControl";
import { ZoomControl } from "./MapControls/ZoomControl";

function MapControls({ shopId, categories, onCategorySelect, onProductSelect, onAIResult }) {
    const map = useMap();

    return (
        <>
            <UnifiedSearchControl
                shopId={shopId}
                categories={categories}
                onCategorySelect={onCategorySelect}
                onProductSelect={onProductSelect}
                onAIResult={onAIResult}
            />
            <ZoomControl map={map} />
        </>
    );
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
    height = 620
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [aiCategories, setAICategories] = useState([]);
    const [routeSource, setRouteSource] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);

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
        }

        console.log('AI result:', result);
    };

    const buildAIRoute = (categories) => {
        if (!categories || categories.length === 0) return;

        // Build multi-point route: Entrance → Category1 → Category2 → ... → Exit
        const entranceX = shop?.entranceX ?? 0;
        const entranceY = shop?.entranceY ?? 50;
        const exitX = shop?.exitX ?? 0;
        const exitY = shop?.exitY ?? 200;

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

    const handleBuildRoute = (categoryId) => {
        // Find category by ID
        const targetCategory = categories.find(cat => cat.id === categoryId);

        if (targetCategory) {
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
                categoryId: categoryId
            });
            console.log('Building route from entrance to:', targetCategory.category?.title);
        }
    };

    return (
        <div style={{ height: height + 'px', width: '100%', position: 'relative' }}>
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
                />
                <MapControls
                    shopId={shopId}
                    categories={categories}
                    onCategorySelect={handleCategorySelect}
                    onProductSelect={handleProductSelect}
                    onAIResult={handleAIResult}
                />
            </MapContainer>
        </div>
    )
}