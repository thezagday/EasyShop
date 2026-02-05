import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ObstacleEditor.css';

// Global map instance to survive React StrictMode
let globalMapInstance = null;
let globalMapContainer = null;

const ObstacleMapEditor = ({ shopId, mapImageUrl, mapWidth, mapHeight }) => {
    const mapContainerRef = useRef(null);
    const [obstacles, setObstacles] = useState([]);
    const [drawingMode, setDrawingMode] = useState(false);
    const [selectedType, setSelectedType] = useState('shelf');
    const [layers, setLayers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    const isDrawingRef = useRef(false);
    const startPointRef = useRef(null);
    const currentRectRef = useRef(null);
    const imageBoundsRef = useRef([[0, 0], [mapHeight, mapWidth]]);

    console.log('🗺️ ObstacleMapEditor render:', { shopId, mapImageUrl, mapWidth, mapHeight, mapReady, globalMapInstance: !!globalMapInstance });

    useEffect(() => {
        const prevBodyOverflowX = document.body.style.overflowX;
        const prevHtmlOverflowX = document.documentElement.style.overflowX;

        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';

        return () => {
            document.body.style.overflowX = prevBodyOverflowX;
            document.documentElement.style.overflowX = prevHtmlOverflowX;
        };
    }, []);

    // Cleanup map on actual component unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Component unmounting - keeping global map');
            // Don't remove global map - it should survive React StrictMode
        };
    }, []);

    useLayoutEffect(() => {
        if (!mapContainerRef.current) return;
        
        console.log('✅ Map initialized without Leaflet');
        setMapReady(true);
    }, [mapImageUrl, mapWidth, mapHeight]);

    useEffect(() => {
        if (!mapReady) return;
        if (!mapContainerRef.current) return;

        const container = mapContainerRef.current;
        const bgImg = container.querySelector('img[data-map-editor-bg="true"]');

        container.querySelectorAll('img').forEach((img) => {
            if (bgImg && img === bgImg) return;
            img.remove();
        });

        container.querySelectorAll('svg').forEach((svg) => {
            svg.remove();
        });

        container.querySelectorAll('.leaflet-container, .leaflet-pane').forEach((el) => {
            el.remove();
        });
    }, [mapReady, mapImageUrl]);

    useEffect(() => {
        if (!mapReady) return;

        loadObstacles();
    }, [mapReady, shopId]);

    const loadObstacles = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}/obstacles`);
            const data = await response.json();
            setObstacles(data);

            data.forEach(obstacle => {
                addObstacleToMap(obstacle);
            });
        } catch (error) {
            console.error('Failed to load obstacles:', error);
        }
    };

    const addObstacleToMap = (obstacle) => {
        if (!mapContainerRef.current) return;
        
        console.log('🟦 Adding obstacle to map:', obstacle);
        
        const container = mapContainerRef.current;
        const containerRect = container.getBoundingClientRect();

        // With object-fit: contain the <img> element fills the container, but the actual
        // rendered image can have internal padding. Calculate the rendered content box.
        const scale = Math.min(containerRect.width / mapWidth, containerRect.height / mapHeight);
        const renderedWidth = mapWidth * scale;
        const renderedHeight = mapHeight * scale;
        const offsetX = (containerRect.width - renderedWidth) / 2;
        const offsetY = (containerRect.height - renderedHeight) / 2;
        
        console.log('🟦 Image dimensions:', {
            displayed: { width: renderedWidth, height: renderedHeight },
            original: { width: mapWidth, height: mapHeight },
            scale,
            offset: { x: offsetX, y: offsetY }
        });
        
        // Create obstacle element
        const obstacleEl = document.createElement('div');
        obstacleEl.className = 'obstacle-absolute';
        obstacleEl.style.position = 'absolute';
        obstacleEl.style.left = `${offsetX + obstacle.x * scale}px`;
        obstacleEl.style.top = `${offsetY + obstacle.y * scale}px`;
        obstacleEl.style.width = `${obstacle.width * scale}px`;
        obstacleEl.style.height = `${obstacle.height * scale}px`;
        obstacleEl.style.border = `3px solid ${getColorByType(obstacle.type)}`;
        obstacleEl.style.backgroundColor = getColorByType(obstacle.type);
        obstacleEl.style.opacity = '0.5';
        obstacleEl.style.pointerEvents = 'auto';
        obstacleEl.style.cursor = 'pointer';
        obstacleEl.style.zIndex = '10';
        obstacleEl.dataset.obstacleId = obstacle.id;
        
        // Add click handler
        obstacleEl.addEventListener('click', () => {
            if (!drawingMode) {
                handleObstacleClick(obstacle, obstacleEl);
            }
        });
        
        container.appendChild(obstacleEl);
        
        console.log('🟦 Obstacle positioned at:', {
            left: obstacleEl.style.left,
            top: obstacleEl.style.top,
            width: obstacleEl.style.width,
            height: obstacleEl.style.height,
            scale
        });
    };

    const getColorByType = (type) => {
        const colors = {
            shelf: '#ff0000',
            wall: '#333333',
            counter: '#0066ff',
            checkout: '#00cc00'
        };
        return colors[type] || '#ff0000';
    };

    const handleObstacleClick = (obstacle, layer) => {
        if (window.confirm(`Delete obstacle (${obstacle.type})?\nCoordinates: x=${obstacle.x}, y=${obstacle.y}`)) {
            deleteObstacle(obstacle.id, layer);
        }
    };

    const deleteObstacle = async (obstacleId, element) => {
        try {
            const response = await fetch(`/api/shops/${shopId}/obstacles/${obstacleId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (element && element.remove) {
                    element.remove();
                }
                setObstacles(prev => prev.filter(o => o.id !== obstacleId));
            }
        } catch (error) {
            console.error('Failed to delete obstacle:', error);
            alert('Failed to delete obstacle');
        }
    };

    const toggleDrawingMode = () => {
        setDrawingMode(!drawingMode);
    };

    useEffect(() => {
        if (!mapContainerRef.current || !drawingMode) return;

        const container = mapContainerRef.current;
        const containerRect = container.getBoundingClientRect();

        const scale = Math.min(containerRect.width / mapWidth, containerRect.height / mapHeight);
        const renderedWidth = mapWidth * scale;
        const renderedHeight = mapHeight * scale;
        const offsetX = (containerRect.width - renderedWidth) / 2;
        const offsetY = (containerRect.height - renderedHeight) / 2;

        const getMapCoordinates = (clientX, clientY) => {
            const x = Math.round((clientX - containerRect.left - offsetX) / scale);
            const y = Math.round((clientY - containerRect.top - offsetY) / scale);
            return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
        };

        const createPreviewRect = (x1, y1, x2, y2) => {
            const rect = document.createElement('div');
            rect.className = 'drawing-preview';
            rect.style.position = 'absolute';
            rect.style.border = `2px dashed ${getColorByType(selectedType)}`;
            rect.style.backgroundColor = getColorByType(selectedType);
            rect.style.opacity = '0.3';
            rect.style.pointerEvents = 'none';
            rect.style.zIndex = '20';
            container.appendChild(rect);
            return rect;
        };

        const handleMouseDown = (e) => {
            const coords = getMapCoordinates(e.clientX, e.clientY);
            isDrawingRef.current = true;
            startPointRef.current = coords;

            // Create preview rectangle
            currentRectRef.current = createPreviewRect(
                offsetX + coords.x * scale,
                offsetY + coords.y * scale,
                offsetX + coords.x * scale,
                offsetY + coords.y * scale
            );
        };

        const handleMouseMove = (e) => {
            if (!isDrawingRef.current || !startPointRef.current || !currentRectRef.current) return;

            const coords = getMapCoordinates(e.clientX, e.clientY);
            const start = startPointRef.current;

            const x1 = Math.min(start.x, coords.x);
            const y1 = Math.min(start.y, coords.y);
            const x2 = Math.max(start.x, coords.x);
            const y2 = Math.max(start.y, coords.y);

            currentRectRef.current.style.left = `${offsetX + x1 * scale}px`;
            currentRectRef.current.style.top = `${offsetY + y1 * scale}px`;
            currentRectRef.current.style.width = `${(x2 - x1) * scale}px`;
            currentRectRef.current.style.height = `${(y2 - y1) * scale}px`;
        };

        const handleMouseUp = async (e) => {
            if (!isDrawingRef.current || !startPointRef.current) return;

            const coords = getMapCoordinates(e.clientX, e.clientY);
            const start = startPointRef.current;

            isDrawingRef.current = false;

            const x1 = Math.min(start.x, coords.x);
            const y1 = Math.min(start.y, coords.y);
            const x2 = Math.max(start.x, coords.x);
            const y2 = Math.max(start.y, coords.y);

            const x = x1;
            const y = y1;
            const width = x2 - x1;
            const height = y2 - y1;

            console.log('🟢 mouseup - calculated obstacle:', { x, y, width, height });

            // Remove preview
            if (currentRectRef.current) {
                currentRectRef.current.remove();
                currentRectRef.current = null;
            }

            if (width > 20 && height > 20) {
                await createObstacle({ x, y, width, height, type: selectedType });
            } else {
                console.warn('Obstacle too small:', { width, height });
            }

            startPointRef.current = null;
        };

        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseUp);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseUp);

            if (currentRectRef.current) {
                currentRectRef.current.remove();
                currentRectRef.current = null;
            }
        };
    }, [drawingMode, selectedType, mapWidth, mapHeight]);

    const createObstacle = async (obstacleData) => {
        try {
            console.log('Sending obstacle data:', obstacleData);

            const response = await fetch(`/api/shops/${shopId}/obstacles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obstacleData)
            });

            if (response.ok) {
                const newObstacle = await response.json();
                console.log('✅ Obstacle created successfully:', newObstacle);
                addObstacleToMap(newObstacle);
                setObstacles(prev => [...prev, newObstacle]);
            } else {
                console.error('❌ Failed to create obstacle:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                alert(`Failed to create obstacle: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Failed to create obstacle:', error);
            alert('Failed to create obstacle');
        }
    };

    const clearAllObstacles = async () => {
        if (!window.confirm('Delete all obstacles? This cannot be undone.')) return;

        setSaving(true);
        try {
            for (const obstacle of obstacles) {
                await fetch(`/api/shops/${shopId}/obstacles/${obstacle.id}`, {
                    method: 'DELETE'
                });
            }

            // Remove all obstacle elements
            if (mapContainerRef.current) {
                const obstacleElements = mapContainerRef.current.querySelectorAll('.obstacle-absolute');
                obstacleElements.forEach(el => el.remove());
            }

            setObstacles([]);
        } catch (error) {
            console.error('Failed to clear obstacles:', error);
            alert('Failed to clear obstacles');
        }
        setSaving(false);
    };

    return (
        <div className="obstacle-editor">
            <div className="editor-toolbar">
                <h3>Obstacle Map Editor</h3>

                <div className="toolbar-section">
                    <label>Obstacle Type:</label>
                    <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        disabled={!drawingMode}
                    >
                        <option value="shelf">Shelf (Red)</option>
                        <option value="wall">Wall (Gray)</option>
                        <option value="counter">Counter (Blue)</option>
                        <option value="checkout">Checkout (Green)</option>
                    </select>
                </div>

                <div className="toolbar-section">
                    <button 
                        className={`btn ${drawingMode ? 'btn-danger' : 'btn-primary'}`}
                        onClick={toggleDrawingMode}
                    >
                        {drawingMode ? '✓ Done Drawing' : '✏️ Draw Obstacle'}
                    </button>

                    <button 
                        className="btn btn-warning"
                        onClick={clearAllObstacles}
                        disabled={obstacles.length === 0 || saving}
                    >
                        🗑️ Clear All
                    </button>
                </div>

                <div className="toolbar-info">
                    <p>Total obstacles: <strong>{obstacles.length}</strong></p>
                    {drawingMode && (
                        <p className="drawing-hint">
                            🖱️ Click and drag to draw a rectangle
                        </p>
                    )}
                    {!drawingMode && obstacles.length > 0 && (
                        <p className="edit-hint">
                            🖱️ Click on obstacle to delete
                        </p>
                    )}
                </div>
            </div>

            <div className="map-container-wrapper" style={{ position: 'relative', maxWidth: '100%', overflow: 'hidden' }}>
                <div className="map-container" ref={mapContainerRef} style={{ height: '70vh', minHeight: '500px', maxHeight: '800px', width: '100%', overflow: 'hidden', border: '2px solid #ccc', position: 'relative', boxSizing: 'border-box' }}>
                    <img 
                        data-map-editor-bg="true"
                        src={mapImageUrl} 
                        alt="Map" 
                        style={{ 
                            position: 'absolute', 
                            top: '0px', 
                            left: '0px', 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            zIndex: 1
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ObstacleMapEditor;
