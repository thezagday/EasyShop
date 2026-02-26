import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Floor } from './Floor';
import { Obstacles3D } from './Obstacles3D';
import { Markers3D } from './Markers3D';
import { Route3D } from './Route3D';
import { RouteBuilder3D } from './RouteBuilder3D';
import { UnifiedSearchControl } from '../Map/MapControls/UnifiedSearchControl';
import { TrackingService } from '../../../services/TrackingService';
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
    const wrapperRef = useRef(null);
    const lastTrackedRouteKeyRef = useRef(null);
    const suppressNextRouteTrackRef = useRef(false);

    const [resetCameraKey, setResetCameraKey] = useState(0);
    const [obstacles, setObstacles] = useState([]);
    const [entranceExit, setEntranceExit] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [routeWaypoints, setRouteWaypoints] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [passedWaypointCount, setPassedWaypointCount] = useState(0);
    const [waypointT, setWaypointT] = useState([]);

    // Search/AI state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [aiCategories, setAICategories] = useState([]);
    const [routeSource, setRouteSource] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);

    useEffect(() => {
        if (!shopId) return;

        const params = new URLSearchParams(window.location.search);
        const activityId = params.get('historyActivity');
        if (!activityId) return;

        const storageKey = `eshop:history-route:${activityId}`;
        const rawPayload = window.sessionStorage.getItem(storageKey);
        if (!rawPayload) return;

        try {
            const payload = JSON.parse(rawPayload);
            if (String(payload?.shopId) !== String(shopId)) return;

            const replayWaypoints = Array.isArray(payload?.waypoints)
                ? payload.waypoints
                    .map((waypoint) => {
                        if (!waypoint || typeof waypoint !== 'object') return null;

                        const x = Number(waypoint.x);
                        const y = Number(waypoint.y);
                        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

                        return {
                            name: waypoint.name || waypoint.title || 'Точка',
                            x,
                            y,
                            categoryId: waypoint.categoryId,
                            commodities: Array.isArray(waypoint.commodities) ? waypoint.commodities : []
                        };
                    })
                    .filter(Boolean)
                : [];

            if (replayWaypoints.length >= 2) {
                suppressNextRouteTrackRef.current = true;
                setSelectedCategory(null);
                setSelectedProduct(null);
                setAICategories([]);
                setRouteDestination(null);
                setRouteSource(replayWaypoints);
            }
        } catch (_) {
            // ignore malformed replay payload
        } finally {
            window.sessionStorage.removeItem(storageKey);
            window.history.replaceState(window.history.state, '', window.location.pathname);
        }
    }, [shopId]);

    const trackRouteInHistory = useCallback((result) => {
        if (!shopId || !result?.info) return;

        if (suppressNextRouteTrackRef.current) {
            suppressNextRouteTrackRef.current = false;
            return;
        }

        const waypointNames = (result.waypoints || [])
            .map(wp => wp?.title || wp?.name || '')
            .join('|');
        const routeKey = `${shopId}:${waypointNames}:${result.info.distance}:${result.info.time}`;

        // Guard against duplicate tracking on internal recalculations (e.g., obstacles state updates)
        if (lastTrackedRouteKeyRef.current === routeKey) {
            return;
        }
        lastTrackedRouteKeyRef.current = routeKey;

        TrackingService.trackRoute(parseInt(shopId, 10), result.waypoints || [], result.info.distance, result.info.time);
    }, [shopId]);

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
                setWaypointT(result.waypointT || []);
                setPassedWaypointCount(0);
                trackRouteInHistory(result);
            }
        }
        // Simple two-point route
        else if (src && dst && typeof src === 'object' && typeof dst === 'object') {
            const result = routeBuilderRef.current.buildSimpleRoute(src, dst);
            if (result) {
                setRoutePoints(result.points);
                setRouteWaypoints(result.waypoints);
                setRouteInfo(result.info);
                setWaypointT([0, 1]);
                setPassedWaypointCount(0);
                trackRouteInHistory(result);
            }
        }
        // Clear
        else if (!src) {
            setRoutePoints([]);
            setRouteWaypoints([]);
            setRouteInfo(null);
            setWaypointT([]);
            setPassedWaypointCount(0);
            lastTrackedRouteKeyRef.current = null;
        }
    }, [routeSource, routeDestination, source, destination, obstacles, trackRouteInHistory]);

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
        lastTrackedRouteKeyRef.current = null;
    }, []);

    const handleBuildRoute = useCallback(async (categoryId) => {
        const targetCategory = categories.find(cat => cat.id === categoryId);
        if (!targetCategory) return;

        const commodities = [];
        if (selectedProduct && selectedProduct.categoryId === categoryId) {
            commodities.push(selectedProduct.name);
        }

        const isDirectMapSelection = !selectedCategory && !selectedProduct && aiCategories.length === 0;
        if (isDirectMapSelection) {
            const categoryQuery = targetCategory.title || targetCategory.category?.title || 'Категория';
            await TrackingService.trackSearch(shopId, categoryQuery);
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
    }, [aiCategories.length, categories, selectedCategory, shop, shopId, selectedProduct]);

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
        <div className="map3d-wrapper" ref={wrapperRef}>
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
                gl={{ antialias: true, toneMapping: THREE.NoToneMapping, alpha: true }}
                style={{ width: '100%', height: '100%', backgroundColor: '#ffffff' }}
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
                    minDistance={3}
                    maxDistance={25}
                    /* Reduce sensitivity */
                    rotateSpeed={0.7}
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
                    /* Mobile: one finger=pan, two fingers=zoom+pan (rotation via custom twist handler) */
                    touches={{
                        ONE: THREE.TOUCH.PAN,
                        TWO: THREE.TOUCH.DOLLY_PAN
                    }}
                    target={[0, 0, 0]}
                    screenSpacePanning={false}
                />

                {/* Lighting */}
                <ambientLight intensity={1.2} />
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
                {routePoints.length > 0 && <Route3D points={routePoints} passedT={waypointT[passedWaypointCount] || 0} />}
                <CameraAnimator controlsRef={controlsRef} resetKey={resetCameraKey} />
                <TouchTwistRotation controlsRef={controlsRef} wrapperRef={wrapperRef} />

                {/* Category / entrance / exit markers */}
                <Markers3D
                    categories={visibleCategories}
                    entranceExit={entranceExit}
                    shop={shop}
                    aiCategories={aiCategories}
                    routeWaypoints={routeWaypoints}
                    onBuildRoute={handleBuildRoute}
                    passedWaypointCount={passedWaypointCount}
                    onWaypointPassed={(idx) => setPassedWaypointCount(idx)}
                />
            </Canvas>

            {/* Compass reset button */}
            <button
                className="map3d-compass-btn"
                title="Сбросить вид"
                onClick={() => setResetCameraKey(k => k + 1)}
            >
                🧭
            </button>

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

function TouchTwistRotation({ controlsRef, wrapperRef }) {
    const { camera } = useThree();
    const angleDeltaRef = useRef(0);
    const prevAngleRef = useRef(null);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        function getAngle(touches) {
            return Math.atan2(
                touches[1].clientY - touches[0].clientY,
                touches[1].clientX - touches[0].clientX
            );
        }

        function onTouchStart(e) {
            if (e.touches.length === 2) prevAngleRef.current = getAngle(e.touches);
        }

        function onTouchMove(e) {
            if (e.touches.length === 2 && prevAngleRef.current !== null) {
                const angle = getAngle(e.touches);
                let delta = angle - prevAngleRef.current;
                if (delta > Math.PI) delta -= 2 * Math.PI;
                if (delta < -Math.PI) delta += 2 * Math.PI;
                angleDeltaRef.current += delta;
                prevAngleRef.current = angle;
            }
        }

        function onTouchEnd(e) {
            if (e.touches.length < 2) prevAngleRef.current = null;
        }

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [wrapperRef]);

    useFrame(() => {
        const delta = angleDeltaRef.current;
        if (Math.abs(delta) < 0.001) return;
        angleDeltaRef.current = 0;
        const controls = controlsRef.current;
        if (!controls) return;

        const target = controls.target;
        const offset = camera.position.clone().sub(target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta);
        camera.position.copy(target).add(offset);
        camera.lookAt(target);
    });

    return null;
}

const INIT_CAM_POS = new THREE.Vector3(0, 12, 8);
const INIT_TARGET  = new THREE.Vector3(0, 0, 0);

function CameraAnimator({ controlsRef, resetKey }) {
    const { camera } = useThree();
    const animating = useRef(false);

    useEffect(() => {
        if (resetKey > 0) animating.current = true;
    }, [resetKey]);

    useFrame(() => {
        if (!animating.current) return;
        camera.position.lerp(INIT_CAM_POS, 0.06);
        if (controlsRef.current) {
            controlsRef.current.target.lerp(INIT_TARGET, 0.06);
            controlsRef.current.update();
        }
        if (camera.position.distanceTo(INIT_CAM_POS) < 0.01) {
            camera.position.copy(INIT_CAM_POS);
            if (controlsRef.current) {
                controlsRef.current.target.copy(INIT_TARGET);
                controlsRef.current.update();
            }
            animating.current = false;
        }
    });

    return null;
}
