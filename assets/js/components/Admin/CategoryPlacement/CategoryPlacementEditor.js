import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CategoryPlacement.css';

const CategoryPlacementEditor = ({ shopId, mapImageUrl, mapWidth, mapHeight }) => {
    const overlayRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [entranceExit, setEntranceExit] = useState({ entranceX: null, entranceY: null, exitX: null, exitY: null });
    const [placingMode, setPlacingMode] = useState(null); // null | 'category' | 'entrance' | 'exit'
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCategories();
        loadEntranceExit();
    }, [shopId]);

    const loadCategories = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadEntranceExit = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}/entrance-exit`);
            if (response.ok) {
                const data = await response.json();
                setEntranceExit(data);
            }
        } catch (error) {
            console.error('Failed to load entrance/exit:', error);
        }
    };

    // Convert click position to map coordinates using the overlay element
    const getMapCoordinates = useCallback((clientX, clientY) => {
        if (!overlayRef.current) return null;
        const rect = overlayRef.current.getBoundingClientRect();
        const x = Math.round((clientX - rect.left) / rect.width * mapWidth);
        const y = Math.round((clientY - rect.top) / rect.height * mapHeight);
        if (x < 0 || x > mapWidth || y < 0 || y > mapHeight) return null;
        return { x, y };
    }, [mapWidth, mapHeight]);

    const handleMapClick = async (e) => {
        if (!placingMode) return;

        const coords = getMapCoordinates(e.clientX, e.clientY);
        if (!coords) return;

        setSaving(true);

        try {
            if (placingMode === 'category' && selectedCategoryId) {
                const response = await fetch(`/api/shops/${shopId}/categories/${selectedCategoryId}/coordinates`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ x_coordinate: coords.x, y_coordinate: coords.y })
                });

                if (response.ok) {
                    const updated = await response.json();
                    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
                }
            } else if (placingMode === 'entrance') {
                const response = await fetch(`/api/shops/${shopId}/entrance-exit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entranceX: coords.x, entranceY: coords.y })
                });

                if (response.ok) {
                    setEntranceExit(await response.json());
                }
            } else if (placingMode === 'exit') {
                const response = await fetch(`/api/shops/${shopId}/entrance-exit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exitX: coords.x, exitY: coords.y })
                });

                if (response.ok) {
                    setEntranceExit(await response.json());
                }
            }
        } catch (error) {
            console.error('Failed to save coordinates:', error);
            alert('Failed to save coordinates');
        }

        setSaving(false);
        // Auto-cancel placing mode so the pin becomes clearly visible
        setPlacingMode(null);
        setSelectedCategoryId(null);
    };

    const startPlacingCategory = (categoryId) => {
        setPlacingMode('category');
        setSelectedCategoryId(categoryId);
    };

    const startPlacingEntrance = () => {
        setPlacingMode('entrance');
        setSelectedCategoryId(null);
    };

    const startPlacingExit = () => {
        setPlacingMode('exit');
        setSelectedCategoryId(null);
    };

    const cancelPlacing = () => {
        setPlacingMode(null);
        setSelectedCategoryId(null);
    };

    // Percentage position: marker left/top as % of image dimensions
    const pctPos = (x, y) => ({
        left: `${(x / mapWidth) * 100}%`,
        top: `${(y / mapHeight) * 100}%`,
    });

    return (
        <div className="category-placement-editor">
            <div className="editor-toolbar">
                <h3>Category & Entrance/Exit Placement</h3>

                <div className="toolbar-section">
                    <button
                        className={`btn ${placingMode === 'entrance' ? 'btn-danger' : 'btn-success'}`}
                        onClick={placingMode === 'entrance' ? cancelPlacing : startPlacingEntrance}
                        disabled={saving}
                    >
                        🚪 {placingMode === 'entrance' ? 'Cancel' : 'Place Entrance'}
                    </button>

                    <button
                        className={`btn ${placingMode === 'exit' ? 'btn-danger' : 'btn-success'}`}
                        onClick={placingMode === 'exit' ? cancelPlacing : startPlacingExit}
                        disabled={saving}
                    >
                        🚶 {placingMode === 'exit' ? 'Cancel' : 'Place Exit'}
                    </button>
                </div>

                {placingMode && (
                    <div className="placement-hint">
                        {placingMode === 'category' && (
                            <p>Click on the map to place category: <strong>{categories.find(c => c.id === selectedCategoryId)?.category_title}</strong></p>
                        )}
                        {placingMode === 'entrance' && (
                            <p>Click on the map to place the <strong>Entrance</strong></p>
                        )}
                        {placingMode === 'exit' && (
                            <p>Click on the map to place the <strong>Exit</strong></p>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={cancelPlacing}>Cancel</button>
                    </div>
                )}

                <div className="categories-list">
                    <h4>Categories ({categories.length})</h4>
                    {categories.length === 0 && <p className="text-muted">No categories assigned to this shop</p>}
                    <div className="categories-grid">
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                className={`category-item ${selectedCategoryId === cat.id ? 'active' : ''} ${cat.x_coordinate != null ? 'placed' : 'unplaced'}`}
                            >
                                <span className="category-name">{cat.category_title}</span>
                                <span className="category-coords">
                                    {cat.x_coordinate != null
                                        ? `(${Math.round(cat.x_coordinate)}, ${Math.round(cat.y_coordinate)})`
                                        : 'Not placed'}
                                </span>
                                <button
                                    className={`btn btn-sm ${selectedCategoryId === cat.id && placingMode === 'category' ? 'btn-danger' : 'btn-outline-primary'}`}
                                    onClick={() => {
                                        if (selectedCategoryId === cat.id && placingMode === 'category') {
                                            cancelPlacing();
                                        } else {
                                            startPlacingCategory(cat.id);
                                        }
                                    }}
                                    disabled={saving}
                                >
                                    {selectedCategoryId === cat.id && placingMode === 'category' ? 'Cancel' : 'Place'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="toolbar-info">
                    <p>Entrance: <strong>{entranceExit.entranceX != null ? `(${Math.round(entranceExit.entranceX)}, ${Math.round(entranceExit.entranceY)})` : 'Not set'}</strong></p>
                    <p>Exit: <strong>{entranceExit.exitX != null ? `(${Math.round(entranceExit.exitX)}, ${Math.round(entranceExit.exitY)})` : 'Not set'}</strong></p>
                </div>
            </div>

            {/* Image-wrapper keeps the image's aspect ratio; overlay + markers sit on top */}
            <div className={`placement-map-wrapper ${placingMode ? 'placing-mode' : ''}`}
                 style={{ cursor: placingMode ? 'crosshair' : 'default' }}>
                <img
                    src={mapImageUrl}
                    alt="Map"
                    className="placement-map-image"
                    draggable={false}
                />
                {/* Transparent overlay sized exactly to the image for click handling & markers */}
                <div
                    ref={overlayRef}
                    className="placement-map-overlay"
                    onClick={handleMapClick}
                >
                    {/* Category markers */}
                    {categories.map(cat => (
                        cat.x_coordinate != null && cat.y_coordinate != null && (
                            <div
                                key={`cat-${cat.id}`}
                                className={`placement-marker category-marker ${selectedCategoryId === cat.id ? 'selected' : ''}`}
                                style={pctPos(cat.x_coordinate, cat.y_coordinate)}
                                title={`${cat.category_title} (${Math.round(cat.x_coordinate)}, ${Math.round(cat.y_coordinate)})`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!placingMode) startPlacingCategory(cat.id);
                                }}
                            >
                                <div className="pin-marker pin-category"><div className="pin-head">🏪</div></div>
                                <span className="marker-label">{cat.category_title}</span>
                            </div>
                        )
                    ))}

                    {/* Entrance marker */}
                    {entranceExit.entranceX != null && entranceExit.entranceY != null && (
                        <div
                            className="placement-marker entrance-marker"
                            style={pctPos(entranceExit.entranceX, entranceExit.entranceY)}
                            title={`Entrance (${Math.round(entranceExit.entranceX)}, ${Math.round(entranceExit.entranceY)})`}
                        >
                            <div className="pin-marker pin-entrance"><div className="pin-head">🚪</div></div>
                            <span className="marker-label">Вход</span>
                        </div>
                    )}

                    {/* Exit marker */}
                    {entranceExit.exitX != null && entranceExit.exitY != null && (
                        <div
                            className="placement-marker exit-marker-pin"
                            style={pctPos(entranceExit.exitX, entranceExit.exitY)}
                            title={`Exit (${Math.round(entranceExit.exitX)}, ${Math.round(entranceExit.exitY)})`}
                        >
                            <div className="pin-marker pin-exit"><div className="pin-head">🚶</div></div>
                            <span className="marker-label">Выход</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPlacementEditor;
