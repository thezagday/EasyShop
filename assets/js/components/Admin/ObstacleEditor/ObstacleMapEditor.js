import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ObstacleEditor.css';

const ObstacleMapEditor = ({ shopId, mapImageUrl, mapWidth, mapHeight }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [obstacles, setObstacles] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingMode, setDrawingMode] = useState(false);
    const [currentRect, setCurrentRect] = useState(null);
    const [startPoint, setStartPoint] = useState(null);
    const [selectedType, setSelectedType] = useState('shelf');
    const [layers, setLayers] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!mapRef.current || map) return;

        // Coordinate system: Top-Left is [0, 0], Bottom-Right is [-mapHeight, mapWidth]
        const imageBounds = [[-mapHeight, 0], [0, mapWidth]];
        
        const leafletMap = L.map(mapRef.current, {
            crs: L.CRS.Simple,
            minZoom: -2,
            maxZoom: 1,
            // Start centered on the image
            center: [-mapHeight / 2, mapWidth / 2],
            zoom: 0,
            zoomControl: true,
            // Increased viscosity for smoother bounds
            maxBoundsViscosity: 1.0,
            // Allow a bit of padding so markers are visible
            maxBounds: [[-mapHeight - 100, -100], [100, mapWidth + 100]]
        });

        L.imageOverlay(mapImageUrl, imageBounds, {
            interactive: true,
            opacity: 1
        }).addTo(leafletMap);
        
        // Debug: Add corner markers to visualize coordinate system
        // Red: Top-Left (DB: 0,0) - SHOULD BE TOP LEFT OF IMAGE
        L.circleMarker([0, 0], {
            radius: 8,
            color: 'red',
            fillColor: 'red',
            fillOpacity: 1
        }).addTo(leafletMap).bindPopup('Top Left (DB: 0,0)');
        
        // Green: Top-Right (DB: 0,W) - SHOULD BE TOP RIGHT OF IMAGE
        L.circleMarker([0, mapWidth], {
            radius: 8,
            color: 'green',
            fillColor: 'green',
            fillOpacity: 1
        }).addTo(leafletMap).bindPopup(`Top Right (DB: 0,${mapWidth})`);
        
        // Blue: Bottom-Left (DB: H,0) - SHOULD BE BOTTOM LEFT OF IMAGE
        L.circleMarker([-mapHeight, 0], {
            radius: 8,
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 1
        }).addTo(leafletMap).bindPopup(`Bottom Left (DB: ${mapHeight},0)`);
        
        // Yellow: Bottom-Right (DB: H,W) - SHOULD BE BOTTOM RIGHT OF IMAGE
        L.circleMarker([-mapHeight, mapWidth], {
            radius: 8,
            color: 'yellow',
            fillColor: 'yellow',
            fillOpacity: 1
        }).addTo(leafletMap).bindPopup(`Bottom Right (DB: ${mapHeight},${mapWidth})`);
        
        leafletMap.fitBounds(imageBounds);

        // Force refresh size and bounds after a short delay
        setTimeout(() => {
            leafletMap.invalidateSize();
            leafletMap.fitBounds(imageBounds, { animate: false });
        }, 100);

        setMap(leafletMap);

        return () => {
            leafletMap.remove();
        };
    }, [mapImageUrl, mapWidth, mapHeight]);

    useEffect(() => {
        if (!map) return;

        loadObstacles();
    }, [map, shopId]);

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
        // Transform DB coords (Y=0 at top) to Leaflet coords (negative Y space)
        // DB: Y=0 is top -> Leaflet: Y=-mapHeight is top
        const leafletY = -obstacle.y;
        const bounds = [
            [leafletY - obstacle.height, obstacle.x],
            [leafletY, obstacle.x + obstacle.width]
        ];

        const color = getColorByType(obstacle.type);

        const rectangle = L.rectangle(bounds, {
            color: color,
            weight: 2,
            fillColor: color,
            fillOpacity: 0.3
        }).addTo(map);

        rectangle.obstacleId = obstacle.id;
        rectangle.obstacleData = obstacle;

        rectangle.on('click', () => {
            if (!drawingMode) {
                handleObstacleClick(obstacle, rectangle);
            }
        });

        setLayers(prev => [...prev, rectangle]);
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

    const deleteObstacle = async (obstacleId, layer) => {
        try {
            const response = await fetch(`/api/shops/${shopId}/obstacles/${obstacleId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                map.removeLayer(layer);
                setObstacles(prev => prev.filter(o => o.id !== obstacleId));
                setLayers(prev => prev.filter(l => l !== layer));
            }
        } catch (error) {
            console.error('Failed to delete obstacle:', error);
            alert('Failed to delete obstacle');
        }
    };

    const toggleDrawingMode = () => {
        setDrawingMode(!drawingMode);
        if (!drawingMode) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.getContainer().style.cursor = 'crosshair';
        } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.getContainer().style.cursor = '';
            if (currentRect) {
                map.removeLayer(currentRect);
                setCurrentRect(null);
            }
        }
    };

    // Ctrl key requirement for map navigation when not in drawing mode
    useEffect(() => {
        if (!map || drawingMode) return;

        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                map.scrollWheelZoom.enable();
                map.dragging.enable();
            }
        };

        const handleKeyUp = (e) => {
            if (!e.ctrlKey && !e.metaKey) {
                map.scrollWheelZoom.disable();
                map.dragging.disable();
            }
        };

        // Disable by default
        map.scrollWheelZoom.disable();
        map.dragging.disable();

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [map, drawingMode]);

    useEffect(() => {
        if (!map || !drawingMode) return;

        const handleMouseDown = (e) => {
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            setIsDrawing(true);
            setStartPoint(e.latlng);
        };

        const handleMouseMove = (e) => {
            if (!isDrawing || !startPoint) return;
            
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();

            if (currentRect) {
                map.removeLayer(currentRect);
            }

            const bounds = [
                [Math.min(startPoint.lat, e.latlng.lat), Math.min(startPoint.lng, e.latlng.lng)],
                [Math.max(startPoint.lat, e.latlng.lat), Math.max(startPoint.lng, e.latlng.lng)]
            ];

            const rect = L.rectangle(bounds, {
                color: getColorByType(selectedType),
                weight: 2,
                fillColor: getColorByType(selectedType),
                fillOpacity: 0.3,
                dashArray: '5, 5'
            }).addTo(map);

            setCurrentRect(rect);
        };

        const handleMouseUp = async (e) => {
            if (!isDrawing || !startPoint) return;
            
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();

            setIsDrawing(false);

            // Leaflet coords: Y ranges from -mapHeight (top) to 0 (bottom)
            // DB coords: Y ranges from 0 (top) to mapHeight (bottom)
            const leafletY1 = Math.max(-mapHeight, Math.min(0, Math.round(startPoint.lat)));
            const leafletY2 = Math.max(-mapHeight, Math.min(0, Math.round(e.latlng.lat)));
            const x1 = Math.max(0, Math.min(mapWidth, Math.round(startPoint.lng)));
            const x2 = Math.max(0, Math.min(mapWidth, Math.round(e.latlng.lng)));
            
            // Convert Leaflet Y (negative) to DB Y (positive from top)
            const dbY1 = -leafletY1;
            const dbY2 = -leafletY2;
            
            const x = Math.min(x1, x2);
            const y = Math.min(dbY1, dbY2);
            const width = Math.abs(x2 - x1);
            const height = Math.abs(dbY2 - dbY1);

            console.log('Mouse coords:', {
                leaflet: { y1: leafletY1, y2: leafletY2 },
                db: { y1: dbY1, y2: dbY2 },
                final: { x, y, width, height }
            });
            
            // Show debug marker where obstacle will be drawn (in Leaflet coords)
            const debugLeafletY = -y;
            const debugMarker = L.circleMarker([debugLeafletY, x], {
                radius: 8,
                color: '#00ff00',
                fillColor: '#00ff00',
                fillOpacity: 0.8
            }).addTo(map);
            
            setTimeout(() => map.removeLayer(debugMarker), 2000);

            if (width > 10 && height > 10) {
                await createObstacle({ x, y, width, height, type: selectedType });
            } else {
                console.warn('Obstacle too small:', { width, height });
            }

            if (currentRect) {
                map.removeLayer(currentRect);
                setCurrentRect(null);
            }

            setStartPoint(null);
        };

        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);
        };
    }, [map, drawingMode, isDrawing, startPoint, currentRect, selectedType]);

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
                console.log('Obstacle created:', newObstacle);
                setObstacles(prev => [...prev, newObstacle]);
                addObstacleToMap(newObstacle);
            } else {
                const error = await response.json();
                console.error('Failed to create obstacle:', error);
                alert('Failed to create obstacle: ' + JSON.stringify(error));
            }
        } catch (error) {
            console.error('Failed to create obstacle:', error);
            alert('Failed to create obstacle: ' + error.message);
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

            layers.forEach(layer => map.removeLayer(layer));
            setLayers([]);
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
                <div className="map-container" ref={mapRef} style={{ height: '70vh', minHeight: '500px', maxHeight: '800px', width: '100%', overflow: 'hidden', border: '2px solid #ccc', position: 'relative', boxSizing: 'border-box' }}></div>
            </div>
        </div>
    );
};

export default ObstacleMapEditor;
