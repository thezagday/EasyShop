import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { SCALE, HALF_W, HALF_H } from './constants';

const BASE_LABEL_Z = [10, 10];
const ACTIVE_LABEL_Z = [100000, 100000];

function toThreePos(x, y, elevation = 0.2) {
    return [
        x * SCALE - HALF_W,
        elevation,
        y * SCALE - HALF_H
    ];
}

function BannerPin({ x, y, title, imageUrl, targetUrl, bannerId, isPopupOpen, onTogglePopup, pinScale }) {
    const pos = toThreePos(x, y, 0.15);

    const handleLabelClick = (e) => {
        e.stopPropagation();
        if (onTogglePopup) onTogglePopup(`banner-${bannerId}`);
    };

    const handleOpenTarget = (e) => {
        e.stopPropagation();
        if (targetUrl) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
        if (onTogglePopup) onTogglePopup(null);
    };

    return (
        <group position={pos} scale={[pinScale * 1.22, pinScale * 1.22, pinScale * 1.22]}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.32, 10]} />
                <meshStandardMaterial color="#f97316" />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.075, 16, 16]} />
                <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} />
            </mesh>
            <Html
                position={[0, 0.5, 0]}
                center
                zIndexRange={isPopupOpen ? ACTIVE_LABEL_Z : BASE_LABEL_Z}
                style={{ pointerEvents: 'auto', zIndex: isPopupOpen ? 100000 : 10 }}
            >
                <div className={`marker3d-label marker3d-banner ${isPopupOpen ? 'marker3d-label-active' : ''}`} onClick={handleLabelClick}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} className="marker3d-banner-thumb" />
                    ) : (
                        <span className="marker3d-emoji">📢</span>
                    )}
                    <span className="marker3d-title">{title}</span>
                </div>
                {isPopupOpen && (
                    <div className="marker3d-popup" onClick={e => e.stopPropagation()}>
                        <div className="marker3d-popup-title">{title}</div>
                        {imageUrl && (
                            <div className="marker3d-popup-image-wrap">
                                <img src={imageUrl} alt={title} className="marker3d-popup-image" />
                            </div>
                        )}
                        {targetUrl && (
                            <button className="marker3d-popup-btn marker3d-banner-btn" onClick={handleOpenTarget}>
                                Открыть предложение
                            </button>
                        )}
                    </div>
                )}
            </Html>
        </group>
    );
}

function CategoryPin({ x, y, title, isTarget, onBuildRoute, categoryId, commodities, isPopupOpen, onTogglePopup, pinScale }) {
    const pos = toThreePos(x, y, 0.15);
    const emoji = isTarget ? '🎯' : '🏪';

    const handleLabelClick = (e) => {
        e.stopPropagation();
        if (onTogglePopup) onTogglePopup(`cat-${categoryId}`);
    };

    const handleBuildRoute = (e) => {
        e.stopPropagation();
        if (onBuildRoute) onBuildRoute(categoryId);
        if (onTogglePopup) onTogglePopup(null);
    };

    return (
        <group position={pos} scale={[pinScale, pinScale, pinScale]}>
            {/* Vertical pole */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.011, 0.011, 0.3, 8]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>
            {/* Sphere head */}
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.065, 16, 16]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
            </mesh>
            {/* HTML label */}
            <Html
                position={[0, 0.5, 0]}
                center
                zIndexRange={isPopupOpen ? ACTIVE_LABEL_Z : BASE_LABEL_Z}
                style={{ pointerEvents: 'auto', zIndex: isPopupOpen ? 100000 : 10 }}
            >
                <div className={`marker3d-label ${isPopupOpen ? 'marker3d-label-active' : ''}`} onClick={handleLabelClick}>
                    <span className="marker3d-emoji">{emoji}</span>
                    <span className="marker3d-title">{title}</span>
                </div>
                {isPopupOpen && (
                    <div className="marker3d-popup" onClick={e => e.stopPropagation()}>
                        <div className="marker3d-popup-title">{title}</div>
                        {commodities && commodities.length > 0 && (
                            <div className="marker3d-popup-commodities">
                                <div className="marker3d-popup-commodities-title">🛒 Нужно взять:</div>
                                <ul>{commodities.map((c, i) => <li key={i}>{c}</li>)}</ul>
                            </div>
                        )}
                        <button className="marker3d-popup-btn" onClick={handleBuildRoute}>
                            Построить маршрут
                        </button>
                    </div>
                )}
            </Html>
        </group>
    );
}

function SpecialPin({ x, y, label, emoji, color, pinScale }) {
    const pos = toThreePos(x, y, 0.15);

    return (
        <group position={pos} scale={[pinScale * 0.96, pinScale * 0.96, pinScale * 0.96]}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            <Html position={[0, 0.5, 0]} center zIndexRange={[0, 0]}>
                <div className="marker3d-label marker3d-special">
                    <span className="marker3d-emoji">{emoji}</span>
                    <span className="marker3d-title">{label}</span>
                </div>
            </Html>
        </group>
    );
}

function TargetPin({ x, y, title, pinScale }) {
    const pos = toThreePos(x, y, 0.15);

    return (
        <group position={pos} scale={[pinScale * 1.04, pinScale * 1.04, pinScale * 1.04]}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
            <Html position={[0, 0.6, 0]} center zIndexRange={[0, 0]}>
                <div className="marker3d-label marker3d-target">
                    <span className="marker3d-emoji">🎯</span>
                    <span className="marker3d-title">{title}</span>
                </div>
            </Html>
        </group>
    );
}

function WaypointPin({ x, y, index, name, commodities, isPopupOpen, onTogglePopup, popupKey, onPassed, showPassedBtn, pinScale }) {
    const pos = toThreePos(x, y, 0.15);

    const handleClick = (e) => {
        e.stopPropagation();
        if (onTogglePopup) onTogglePopup(popupKey);
    };

    return (
        <group position={pos} scale={[pinScale, pinScale, pinScale]}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                <meshStandardMaterial color="#667eea" />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={0.5} />
            </mesh>
            <Html
                position={[0, 0.55, 0]}
                center
                zIndexRange={isPopupOpen ? ACTIVE_LABEL_Z : BASE_LABEL_Z}
                style={{ pointerEvents: 'auto', zIndex: isPopupOpen ? 100000 : 10 }}
            >
                <div className={`marker3d-label marker3d-waypoint ${isPopupOpen ? 'marker3d-label-active' : ''}`} onClick={handleClick}>
                    <span className="marker3d-index">{index}</span>
                    <span className="marker3d-title">{name}</span>
                </div>
                {isPopupOpen && (
                    <div className="marker3d-popup" onClick={e => e.stopPropagation()}>
                        <div className="marker3d-popup-title">{name}</div>
                        {commodities && commodities.length > 0 && (
                            <div className="marker3d-popup-commodities">
                                <div className="marker3d-popup-commodities-title">🛒 Нужно взять:</div>
                                <ul>{commodities.map((c, i) => <li key={i}>{c}</li>)}</ul>
                            </div>
                        )}
                        {showPassedBtn && (
                            <button
                                className="marker3d-popup-btn marker3d-passed-btn"
                                onClick={(e) => { e.stopPropagation(); onPassed && onPassed(index); onTogglePopup && onTogglePopup(null); }}
                            >
                                ✅ Пройдено
                            </button>
                        )}
                    </div>
                )}
            </Html>
        </group>
    );
}

export function Markers3D({ categories, banners = [], entranceExit, shop, aiCategories, routeWaypoints, onBuildRoute, passedWaypointCount = 0, onWaypointPassed }) {
    const [openPopupId, setOpenPopupId] = useState(null);
    const [pinScale, setPinScale] = useState(1);
    const pinScaleRef = useRef(1);
    const { camera, controls } = useThree();

    useEffect(() => {
        const updatePinScale = () => {
            const distance = controls?.target
                ? camera.position.distanceTo(controls.target)
                : camera.position.length();
            // Keep pin geometry visually comfortable: shrink when zooming in, grow when zooming out.
            const nextScale = Math.max(0.74, Math.min(1.28, distance / 13.5));

            if (Math.abs(nextScale - pinScaleRef.current) > 0.02) {
                pinScaleRef.current = nextScale;
                setPinScale(nextScale);
            }
        };

        updatePinScale();

        if (!controls?.addEventListener) return undefined;

        let rafId = null;
        const onControlsChange = () => {
            if (rafId !== null) return;
            rafId = window.requestAnimationFrame(() => {
                rafId = null;
                updatePinScale();
            });
        };

        controls.addEventListener('change', onControlsChange);

        return () => {
            controls.removeEventListener('change', onControlsChange);
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, [camera, controls]);

    const handleTogglePopup = (popupKey) => {
        setOpenPopupId(prev => prev === popupKey ? null : popupKey);
    };

    const aiCategoryIds = useMemo(() => {
        const ids = new Set();
        if (Array.isArray(aiCategories)) {
            aiCategories.forEach(cat => {
                if (cat.id) ids.add(cat.id);
            });
        }
        return ids;
    }, [aiCategories]);

    const routeCategoryIds = useMemo(() => {
        const ids = new Set();
        if (Array.isArray(routeWaypoints)) {
            routeWaypoints.forEach(wp => {
                if (wp.categoryId) ids.add(wp.categoryId);
            });
        }
        return ids;
    }, [routeWaypoints]);

    const activeCategoryId = useMemo(() => {
        if (typeof openPopupId !== 'string' || !openPopupId.startsWith('cat-')) return null;
        return openPopupId.slice(4);
    }, [openPopupId]);

    const activeCategory = useMemo(() => {
        if (!Array.isArray(categories) || activeCategoryId == null) return null;
        return categories.find(cat => String(cat.id) === String(activeCategoryId)) || null;
    }, [categories, activeCategoryId]);

    const activeBannerId = useMemo(() => {
        if (typeof openPopupId !== 'string' || !openPopupId.startsWith('banner-')) return null;
        return openPopupId.slice(7);
    }, [openPopupId]);

    const activeBanner = useMemo(() => {
        if (!Array.isArray(banners) || activeBannerId == null) return null;
        return banners.find(banner => String(banner.id) === String(activeBannerId)) || null;
    }, [banners, activeBannerId]);

    const orderedCategories = useMemo(() => {
        if (!Array.isArray(categories)) return [];

        if (activeCategoryId == null) return categories;
        return categories.filter(cat => String(cat.id) !== String(activeCategoryId));
    }, [categories, activeCategoryId]);

    const orderedBanners = useMemo(() => {
        if (!Array.isArray(banners)) return [];

        if (activeBannerId == null) return banners;
        return banners.filter(banner => String(banner.id) !== String(activeBannerId));
    }, [banners, activeBannerId]);

    return (
        <group>
            {/* Category markers */}
            {orderedCategories.map(cat => {
                if (cat.x_coordinate == null || cat.y_coordinate == null) return null;
                if (routeCategoryIds.has(cat.id)) return null;

                const title = cat.title || cat.category?.title || 'Категория';
                const isTarget = aiCategoryIds.has(cat.id);

                // Find commodities from AI results for this category
                const aiCat = Array.isArray(aiCategories) ? aiCategories.find(ac => ac.id === cat.id) : null;
                const commodities = aiCat?.commodities || [];

                return (
                    <CategoryPin
                        key={`cat-${cat.id}`}
                        x={cat.x_coordinate}
                        y={cat.y_coordinate}
                        title={title}
                        isTarget={isTarget}
                        categoryId={cat.id}
                        commodities={commodities}
                        onBuildRoute={onBuildRoute}
                        isPopupOpen={openPopupId === `cat-${cat.id}`}
                        onTogglePopup={handleTogglePopup}
                        pinScale={pinScale}
                    />
                );
            })}

            {/* Advertisement banners */}
            {orderedBanners.map((banner) => {
                if (banner.x_coordinate == null || banner.y_coordinate == null) return null;

                return (
                    <BannerPin
                        key={`banner-${banner.id}`}
                        bannerId={banner.id}
                        x={banner.x_coordinate}
                        y={banner.y_coordinate}
                        title={banner.title}
                        imageUrl={banner.imageUrl}
                        targetUrl={banner.targetUrl}
                        isPopupOpen={openPopupId === `banner-${banner.id}`}
                        onTogglePopup={handleTogglePopup}
                        pinScale={pinScale}
                    />
                );
            })}

            {/* Entrance */}
            {entranceExit?.entranceX != null && entranceExit?.entranceY != null && (
                <SpecialPin
                    x={entranceExit.entranceX}
                    y={entranceExit.entranceY}
                    label="Вход"
                    emoji="🚪"
                    color="#22c55e"
                    pinScale={pinScale}
                />
            )}

            {/* Exit */}
            {entranceExit?.exitX != null && entranceExit?.exitY != null && (
                <SpecialPin
                    x={entranceExit.exitX}
                    y={entranceExit.exitY}
                    label="Выход"
                    emoji="🚶"
                    color="#ef4444"
                    pinScale={pinScale}
                />
            )}

            {/* Route waypoints */}
            {Array.isArray(routeWaypoints) && routeWaypoints.map((wp, idx) => {
                if (idx === 0 || idx === routeWaypoints.length - 1) return null;
                return (
                    <WaypointPin
                        key={`wp-${idx}`}
                        x={wp.x}
                        y={wp.y}
                        index={idx}
                        name={wp.name}
                        commodities={wp.commodities || []}
                        popupKey={`wp-${idx}`}
                        isPopupOpen={openPopupId === `wp-${idx}`}
                        onTogglePopup={handleTogglePopup}
                        onPassed={onWaypointPassed}
                        showPassedBtn={idx === passedWaypointCount + 1}
                        pinScale={pinScale}
                    />
                );
            })}

            {/* Target destination marker */}
            {Array.isArray(routeWaypoints) && routeWaypoints.length > 0 && (() => {
                const last = routeWaypoints[routeWaypoints.length - 1];
                if (!last || last.name === 'Выход') return null;
                return (
                    <TargetPin
                        x={last.x}
                        y={last.y}
                        title={last.name}
                        pinScale={pinScale}
                    />
                );
            })()}

            {/* Active category marker rendered last to guarantee visual priority */}
            {activeCategory && !routeCategoryIds.has(activeCategory.id) && activeCategory.x_coordinate != null && activeCategory.y_coordinate != null && (
                <CategoryPin
                    key={`cat-active-${activeCategory.id}`}
                    x={activeCategory.x_coordinate}
                    y={activeCategory.y_coordinate}
                    title={activeCategory.title || activeCategory.category?.title || 'Категория'}
                    isTarget={aiCategoryIds.has(activeCategory.id)}
                    categoryId={activeCategory.id}
                    commodities={(Array.isArray(aiCategories) ? aiCategories.find(ac => ac.id === activeCategory.id) : null)?.commodities || []}
                    onBuildRoute={onBuildRoute}
                    isPopupOpen={openPopupId === `cat-${activeCategory.id}`}
                    onTogglePopup={handleTogglePopup}
                    pinScale={pinScale}
                />
            )}

            {/* Active banner marker rendered last to guarantee visual priority */}
            {activeBanner && activeBanner.x_coordinate != null && activeBanner.y_coordinate != null && (
                <BannerPin
                    key={`banner-active-${activeBanner.id}`}
                    bannerId={activeBanner.id}
                    x={activeBanner.x_coordinate}
                    y={activeBanner.y_coordinate}
                    title={activeBanner.title}
                    imageUrl={activeBanner.imageUrl}
                    targetUrl={activeBanner.targetUrl}
                    isPopupOpen={openPopupId === `banner-${activeBanner.id}`}
                    onTogglePopup={handleTogglePopup}
                    pinScale={pinScale}
                />
            )}
        </group>
    );
}
