import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './ObstacleEditor.css';

const ObstacleMapEditor = ({ shopId, mapImageUrl, mapWidth, mapHeight }) => {
    const { t } = useTranslation();
    const overlayRef = useRef(null);
    const [obstacles, setObstacles] = useState([]);
    const [drawingMode, setDrawingMode] = useState(false);
    const [selectedType, setSelectedType] = useState('shelf');
    const [saving, setSaving] = useState(false);

    const isDrawingRef = useRef(false);
    const startPointRef = useRef(null);
    const currentRectRef = useRef(null);

    useEffect(() => {
        loadObstacles();
    }, [shopId]);

    const loadObstacles = async () => {
        try {
            const response = await fetch(`/api/shops/${shopId}/obstacles`);
            const data = await response.json();
            setObstacles(data);
        } catch (error) {
            console.error('Failed to load obstacles:', error);
        }
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

    // Convert click position to map coordinates using the overlay
    const getMapCoordinates = (clientX, clientY) => {
        if (!overlayRef.current) return null;
        const rect = overlayRef.current.getBoundingClientRect();
        const x = Math.round((clientX - rect.left) / rect.width * mapWidth);
        const y = Math.round((clientY - rect.top) / rect.height * mapHeight);
        return {
            x: Math.max(0, Math.min(mapWidth, x)),
            y: Math.max(0, Math.min(mapHeight, y))
        };
    };

    // Percentage helpers for obstacle rectangles
    const pctLeft = (x) => `${(x / mapWidth) * 100}%`;
    const pctTop = (y) => `${(y / mapHeight) * 100}%`;
    const pctWidth = (w) => `${(w / mapWidth) * 100}%`;
    const pctHeight = (h) => `${(h / mapHeight) * 100}%`;

    const handleObstacleClick = (obstacle) => {
        if (drawingMode) return;
        if (window.confirm(t('admin.confirm.delete_obstacle', { type: obstacle.type, x: obstacle.x, y: obstacle.y, w: obstacle.width, h: obstacle.height }))) {
            deleteObstacle(obstacle.id);
        }
    };

    const deleteObstacle = async (obstacleId) => {
        try {
            const response = await fetch(`/api/shops/${shopId}/obstacles/${obstacleId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setObstacles(prev => prev.filter(o => o.id !== obstacleId));
            }
        } catch (error) {
            console.error('Failed to delete obstacle:', error);
            alert(t('common.error'));
        }
    };

    const toggleDrawingMode = () => {
        setDrawingMode(!drawingMode);
    };

    // Drawing handlers on the overlay
    useEffect(() => {
        if (!overlayRef.current || !drawingMode) return;

        const overlay = overlayRef.current;

        const handleMouseDown = (e) => {
            const coords = getMapCoordinates(e.clientX, e.clientY);
            if (!coords) return;
            isDrawingRef.current = true;
            startPointRef.current = coords;

            // Create preview rectangle using percentage positioning
            const rect = document.createElement('div');
            rect.className = 'drawing-preview';
            rect.style.position = 'absolute';
            rect.style.border = `2px dashed ${getColorByType(selectedType)}`;
            rect.style.backgroundColor = getColorByType(selectedType);
            rect.style.opacity = '0.3';
            rect.style.pointerEvents = 'none';
            rect.style.zIndex = '20';
            rect.style.left = pctLeft(coords.x);
            rect.style.top = pctTop(coords.y);
            rect.style.width = '0%';
            rect.style.height = '0%';
            overlay.appendChild(rect);
            currentRectRef.current = rect;
        };

        const handleMouseMove = (e) => {
            if (!isDrawingRef.current || !startPointRef.current || !currentRectRef.current) return;

            const coords = getMapCoordinates(e.clientX, e.clientY);
            if (!coords) return;
            const start = startPointRef.current;

            const x1 = Math.min(start.x, coords.x);
            const y1 = Math.min(start.y, coords.y);
            const x2 = Math.max(start.x, coords.x);
            const y2 = Math.max(start.y, coords.y);

            currentRectRef.current.style.left = pctLeft(x1);
            currentRectRef.current.style.top = pctTop(y1);
            currentRectRef.current.style.width = pctWidth(x2 - x1);
            currentRectRef.current.style.height = pctHeight(y2 - y1);
        };

        const handleMouseUp = async (e) => {
            if (!isDrawingRef.current || !startPointRef.current) return;

            const coords = getMapCoordinates(e.clientX, e.clientY);
            if (!coords) return;
            const start = startPointRef.current;

            isDrawingRef.current = false;

            const x = Math.min(start.x, coords.x);
            const y = Math.min(start.y, coords.y);
            const width = Math.abs(coords.x - start.x);
            const height = Math.abs(coords.y - start.y);

            // Remove preview
            if (currentRectRef.current) {
                currentRectRef.current.remove();
                currentRectRef.current = null;
            }

            if (width > 20 && height > 20) {
                await createObstacle({ x, y, width, height, type: selectedType });
            }

            startPointRef.current = null;
        };

        overlay.addEventListener('mousedown', handleMouseDown);
        overlay.addEventListener('mousemove', handleMouseMove);
        overlay.addEventListener('mouseup', handleMouseUp);
        overlay.addEventListener('mouseleave', handleMouseUp);

        return () => {
            overlay.removeEventListener('mousedown', handleMouseDown);
            overlay.removeEventListener('mousemove', handleMouseMove);
            overlay.removeEventListener('mouseup', handleMouseUp);
            overlay.removeEventListener('mouseleave', handleMouseUp);

            if (currentRectRef.current) {
                currentRectRef.current.remove();
                currentRectRef.current = null;
            }
        };
    }, [drawingMode, selectedType, mapWidth, mapHeight]);

    const createObstacle = async (obstacleData) => {
        try {
            const response = await fetch(`/api/shops/${shopId}/obstacles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obstacleData)
            });

            if (response.ok) {
                const newObstacle = await response.json();
                setObstacles(prev => [...prev, newObstacle]);
            } else {
                alert(`${t('common.error')}: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to create obstacle:', error);
            alert(t('common.error'));
        }
    };

    const clearAllObstacles = async () => {
        if (!window.confirm(t('admin.confirm.clear_obstacles'))) return;

        setSaving(true);
        try {
            for (const obstacle of obstacles) {
                await fetch(`/api/shops/${shopId}/obstacles/${obstacle.id}`, {
                    method: 'DELETE'
                });
            }
            setObstacles([]);
        } catch (error) {
            console.error('Failed to clear obstacles:', error);
            alert(t('common.error'));
        }
        setSaving(false);
    };

    return (
        <div className="obstacle-editor">
            <div className="editor-toolbar">
                <h3>{t('admin.obstacle_map_editor')}</h3>

                <div className="toolbar-section">
                    <label>{t('admin.obstacle_type')}:</label>
                    <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        disabled={!drawingMode}
                    >
                        <option value="shelf">{t('admin.obstacle_types.shelf')}</option>
                        <option value="wall">{t('admin.obstacle_types.wall')}</option>
                        <option value="counter">{t('admin.obstacle_types.counter')}</option>
                        <option value="checkout">{t('admin.obstacle_types.checkout')}</option>
                    </select>
                </div>

                <div className="toolbar-section">
                    <button 
                        className={`btn ${drawingMode ? 'btn-danger' : 'btn-primary'}`}
                        onClick={toggleDrawingMode}
                    >
                        {drawingMode ? t('admin.done') : t('admin.draw')}
                    </button>

                    <button 
                        className="btn btn-warning"
                        onClick={clearAllObstacles}
                        disabled={obstacles.length === 0 || saving}
                    >
                        {t('admin.clear')}
                    </button>
                </div>

                <div className="toolbar-info">
                    <p>{t('admin.total_obstacles')}: <strong>{obstacles.length}</strong></p>
                    {drawingMode && (
                        <p className="drawing-hint">
                            {t('admin.hints.draw')}
                        </p>
                    )}
                    {!drawingMode && obstacles.length > 0 && (
                        <p className="edit-hint">
                            {t('admin.hints.click_to_delete')}
                        </p>
                    )}
                </div>
            </div>

            <div className="obstacle-map-wrapper">
                <img
                    src={mapImageUrl}
                    alt="Map"
                    className="obstacle-map-image"
                    draggable={false}
                />
                <div
                    ref={overlayRef}
                    className="obstacle-map-overlay"
                    style={{ cursor: drawingMode ? 'crosshair' : 'default' }}
                >
                    {/* Render obstacles as percentage-positioned divs */}
                    {obstacles.map(obs => (
                        <div
                            key={obs.id}
                            className="obstacle-rect"
                            style={{
                                left: pctLeft(obs.x),
                                top: pctTop(obs.y),
                                width: pctWidth(obs.width),
                                height: pctHeight(obs.height),
                                borderColor: getColorByType(obs.type),
                                backgroundColor: getColorByType(obs.type),
                            }}
                            onClick={() => handleObstacleClick(obs)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ObstacleMapEditor;
