import React, { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { SCALE, HALF_W, HALF_H } from './constants';

function toThreePos(x, y, elevation = 0.2) {
    return [
        x * SCALE - HALF_W,
        elevation,
        y * SCALE - HALF_H
    ];
}

function CategoryPin({ x, y, title, isTarget, onBuildRoute, categoryId, commodities, isPopupOpen, onTogglePopup }) {
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
        <group position={pos}>
            {/* Vertical pole */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>
            {/* Sphere head */}
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
            </mesh>
            {/* HTML label */}
            <Html
                position={[0, 0.5, 0]}
                center
                distanceFactor={8}
                zIndexRange={[0, 0]}
                style={{ pointerEvents: 'auto' }}
            >
                <div className="marker3d-label" onClick={handleLabelClick}>
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

function SpecialPin({ x, y, label, emoji, color }) {
    const pos = toThreePos(x, y, 0.15);

    return (
        <group position={pos}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
            </mesh>
            <Html position={[0, 0.5, 0]} center distanceFactor={8} zIndexRange={[0, 0]}>
                <div className="marker3d-label marker3d-special">
                    <span className="marker3d-emoji">{emoji}</span>
                    <span className="marker3d-title">{label}</span>
                </div>
            </Html>
        </group>
    );
}

function TargetPin({ x, y, title }) {
    const pos = toThreePos(x, y, 0.15);

    return (
        <group position={pos}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
            <Html position={[0, 0.6, 0]} center distanceFactor={8} zIndexRange={[0, 0]}>
                <div className="marker3d-label marker3d-target">
                    <span className="marker3d-emoji">🎯</span>
                    <span className="marker3d-title">{title}</span>
                </div>
            </Html>
        </group>
    );
}

function WaypointPin({ x, y, index, name, commodities, isPopupOpen, onTogglePopup, popupKey, onPassed, showPassedBtn }) {
    const pos = toThreePos(x, y, 0.15);

    const handleClick = (e) => {
        e.stopPropagation();
        if (onTogglePopup) onTogglePopup(popupKey);
    };

    return (
        <group position={pos}>
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
                <meshStandardMaterial color="#667eea" />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={0.5} />
            </mesh>
            <Html position={[0, 0.55, 0]} center distanceFactor={8} zIndexRange={[0, 0]} style={{ pointerEvents: 'auto' }}>
                <div className="marker3d-label marker3d-waypoint" onClick={handleClick}>
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

export function Markers3D({ categories, entranceExit, shop, aiCategories, routeWaypoints, onBuildRoute, passedWaypointCount = 0, onWaypointPassed }) {
    const [openPopupId, setOpenPopupId] = useState(null);

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

    return (
        <group>
            {/* Category markers */}
            {Array.isArray(categories) && categories.map(cat => {
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
                    />
                );
            })()}
        </group>
    );
}
