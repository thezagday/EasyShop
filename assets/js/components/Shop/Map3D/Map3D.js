import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Floor } from './Floor';
import { Obstacles3D } from './Obstacles3D';
import { Markers3D } from './Markers3D';
import { Route3D } from './Route3D';
import { RouteBuilder3D } from './RouteBuilder3D';
import { UnifiedSearchControl } from '../Map/MapControls/UnifiedSearchControl';
import './Map3D.css';

export default function Map3D({
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
    const controlsRef = useRef(null);
    const routeBuilderRef = useRef(null);

    const [obstacles, setObstacles] = useState([]);
    const [entranceExit, setEntranceExit] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [routeWaypoints, setRouteWaypoints] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);

    // Search/AI state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [aiCategories, setAICategories] = useState([]);
    const [routeSource, setRouteSource] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);

    // Load obstacles
    useEffect(() => {
        if (!shopId) return;
        fetch(`/api/shops/${shopId}/obstacles`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                setObstacles(data);
                // Initialize route builder after obstacles loaded
                if (routeBuilderRef.current) {
                    routeBuilderRef.current.setObstacles(data);
                }
            })
            .catch(() => setObstacles([]));
    }, [shopId]);

    // Load entrance/exit
    useEffect(() => {
        if (!shopId) return;
        fetch(`/api/shops/${shopId}/entrance-exit`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setEntranceExit(data); })
            .catch(() => {});
    }, [shopId]);

    // Initialize route builder
    useEffect(() => {
        routeBuilderRef.current = new RouteBuilder3D();
    }, []);

    // Update route builder when obstacles change
    useEffect(() => {
        if (routeBuilderRef.current && obstacles.length > 0) {
            routeBuilderRef.current.setObstacles(obstacles);
        }
    }, [obstacles]);

    // Build route when source/destination change
    useEffect(() => {
        if (!routeBuilderRef.current) return;

        const src = routeSource || source;
        const dst = routeDestination || destination;

        // Multi-point route
        if (Array.isArray(src) && src.length > 0) {
            const result = routeBuilderRef.current.buildMultiRoute(src);
            if (result) {
                setRoutePoints(result.points);
                setRouteWaypoints(result.waypoints);
                setRouteInfo(result.info);
            }
        }
        // Simple two-point route
        else if (src && dst && typeof src === 'object' && typeof dst === 'object') {
            const result = routeBuilderRef.current.buildSimpleRoute(src, dst);
            if (result) {
                setRoutePoints(result.points);
                setRouteWaypoints(result.waypoints);
                setRouteInfo(result.info);
            }
        }
        // Clear
        else if (!src) {
            setRoutePoints([]);
            setRouteWaypoints([]);
            setRouteInfo(null);
        }
    }, [routeSource, routeDestination, source, destination, obstacles]);

    // Handlers (same logic as old Map.js)
    const handleCategorySelect = useCallback((category) => {
        setSelectedCategory(category);
        setSelectedProduct(null);
        setAICategories([]);
    }, []);

    const handleProductSelect = useCallback((product) => {
        setSelectedProduct(product);
        setSelectedCategory(null);
        setAICategories([]);
    }, []);

    const handleAIResult = useCallback((result) => {
        setAICategories(result.categories || []);
        setSelectedCategory(null);
        setSelectedProduct(null);

        if (result.buildRoute && result.categories && result.categories.length > 0) {
            buildAIRoute(result.categories);
        } else {
            setRouteSource(null);
            setRouteDestination(null);
            setRouteInfo(null);
        }
    }, [entranceExit]);

    const buildAIRoute = useCallback((cats) => {
        if (!cats || cats.length === 0) return;
        const entranceX = entranceExit?.entranceX ?? 0;
        const entranceY = entranceExit?.entranceY ?? 0;
        const exitX = entranceExit?.exitX ?? 0;
        const exitY = entranceExit?.exitY ?? 0;

        const waypoints = [
            { name: 'Вход', x: entranceX, y: entranceY },
            ...cats.map(cat => ({
                name: cat.title || cat.category?.title || 'Категория',
                x: cat.x_coordinate,
                y: cat.y_coordinate,
                categoryId: cat.id,
                commodities: cat.commodities || []
            })),
            { name: 'Выход', x: exitX, y: exitY }
        ];
        setRouteSource(waypoints);
        setRouteDestination(null);
    }, [entranceExit]);

    const handleCollectionSelect = useCallback((collection) => {
        if (!collection.items || collection.items.length === 0) return;
        setRouteSource(null);
        setRouteDestination(null);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setAICategories([]);

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
        setTimeout(() => buildAIRoute(cats), 50);
    }, [buildAIRoute]);

    const handleRouteReset = useCallback(() => {
        setRouteSource(null);
        setRouteDestination(null);
        setAICategories([]);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setRouteInfo(null);
        setRoutePoints([]);
        setRouteWaypoints([]);
    }, []);

    const handleBuildRoute = useCallback((categoryId) => {
        const targetCategory = categories.find(cat => cat.id === categoryId);
        if (!targetCategory) return;

        const commodities = [];
        if (selectedProduct && selectedProduct.categoryId === categoryId) {
            commodities.push(selectedProduct.name);
        }

        setSelectedCategory(null);
        setSelectedProduct(null);

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
    }, [categories, shop, selectedProduct]);

    // Determine visible categories
    const activeCategoryIds = useMemo(() => {
        const ids = new Set();
        if (selectedCategory?.id) ids.add(selectedCategory.id);
        if (selectedProduct?.categoryId) ids.add(selectedProduct.categoryId);
        if (aiCategories?.length > 0) {
            aiCategories.forEach(cat => {
                if (cat.id) ids.add(cat.id);
                else if (cat.categoryId) ids.add(cat.categoryId);
            });
        }
        const dst = routeDestination || destination;
        if (dst?.categoryId) ids.add(dst.categoryId);
        const src = routeSource || source;
        if (Array.isArray(src)) {
            src.forEach(wp => { if (wp.categoryId) ids.add(wp.categoryId); });
        } else if (src?.categoryId) {
            ids.add(src.categoryId);
        }
        return ids;
    }, [selectedCategory, selectedProduct, aiCategories, routeDestination, destination, routeSource, source]);

    const visibleCategories = useMemo(() => {
        return activeCategoryIds.size > 0
            ? categories.filter(cat => activeCategoryIds.has(cat.id))
            : categories;
    }, [categories, activeCategoryIds]);

    const shopName = shop?.title ? shop.title.split(' - ')[0] : '';
    const shopAddress = shop?.title && shop.title.includes(' - ') ? shop.title.split(' - ').slice(1).join(' - ') : '';

    const mapImageUrl = shop?.mapImage ? `/img/${shop.mapImage}` : null;

    return (
        <div className="map3d-wrapper">
            {/* Shop header */}
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

            {/* Route info bar */}
            {routeInfo && (
                <div className="route-info-bar">
                    <span className="route-chip">🗺️ {routeInfo.from} → {routeInfo.to}</span>
                    <span className="route-chip">📏 ~{routeInfo.distance}м</span>
                    <span className="route-chip">⏱ ~{routeInfo.time} мин</span>
                    <button className="route-reset-btn" onClick={handleRouteReset}>✕</button>
                </div>
            )}

            {/* 3D Canvas */}
            <Canvas
                shadows
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
                style={{ width: '100%', height: '100%', background: '#ffffff' }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={[0, 12, 8]}
                    fov={50}
                    near={0.1}
                    far={100}
                />
                <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    /* Google Maps-like: mostly top-down, slight tilt allowed */
                    minPolarAngle={0.1}
                    maxPolarAngle={Math.PI / 3}
                    /* Limit horizontal rotation to ±45° */
                    minAzimuthAngle={-Math.PI / 4}
                    maxAzimuthAngle={Math.PI / 4}
                    minDistance={3}
                    maxDistance={25}
                    /* Reduce sensitivity */
                    rotateSpeed={0.3}
                    panSpeed={0.5}
                    zoomSpeed={0.6}
                    /* Smooth damping */
                    enableDamping={true}
                    dampingFactor={0.1}
                    /* Swap: LEFT=pan, RIGHT=rotate (Google Maps style) */
                    mouseButtons={{
                        LEFT: THREE.MOUSE.PAN,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.ROTATE
                    }}
                    target={[0, 0, 0]}
                    screenSpacePanning={false}
                />

                {/* Lighting */}
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[8, 15, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                    shadow-camera-left={-12}
                    shadow-camera-right={12}
                    shadow-camera-top={12}
                    shadow-camera-bottom={-12}
                />
                <directionalLight position={[-5, 8, -5]} intensity={0.3} />

                {/* Floor with map texture */}
                <Floor mapImageUrl={mapImageUrl} />

                {/* 3D Obstacles */}
                <Obstacles3D obstacles={obstacles} />

                {/* Route line */}
                {routePoints.length > 0 && <Route3D points={routePoints} />}

                {/* Category / entrance / exit markers */}
                <Markers3D
                    categories={visibleCategories}
                    entranceExit={entranceExit}
                    shop={shop}
                    aiCategories={aiCategories}
                    routeWaypoints={routeWaypoints}
                    onBuildRoute={handleBuildRoute}
                />
            </Canvas>

            {/* Search controls overlay (pure React, reused from old Map) */}
            <UnifiedSearchControl
                shopId={shopId}
                categories={categories}
                onCategorySelect={handleCategorySelect}
                onProductSelect={handleProductSelect}
                onAIResult={handleAIResult}
                onCollectionSelect={handleCollectionSelect}
            />
        </div>
    );
}
