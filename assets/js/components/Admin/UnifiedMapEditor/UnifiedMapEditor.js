import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './UnifiedMapEditor.css';

const getColorByType = (type) => {
    const colors = { shelf: '#ff0000', wall: '#333333', counter: '#0066ff', checkout: '#00cc00' };
    return colors[type] || '#ff0000';
};

const ZOOM_MIN = 0.15;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.15;

const UnifiedMapEditor = ({ shopId, mapImageUrl, mapWidth, mapHeight }) => {
    const { t } = useTranslation();
    const viewportRef = useRef(null);
    const innerRef = useRef(null);
    const overlayRef = useRef(null);

    // Zoom & pan state (refs for performance, state for UI display)
    const scaleRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    const [scaleDisplay, setScaleDisplay] = useState(1);
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

    // Obstacles
    const [obstacles, setObstacles] = useState([]);
    const [drawingMode, setDrawingMode] = useState(false);
    const [selectedObstacleType, setSelectedObstacleType] = useState('shelf');
    const isDrawingRef = useRef(false);
    const startPointRef = useRef(null);
    const currentRectRef = useRef(null);

    // Categories & entrance/exit
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [entranceExit, setEntranceExit] = useState({ entranceX: null, entranceY: null, exitX: null, exitY: null });
    const [placingMode, setPlacingMode] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedBannerId, setSelectedBannerId] = useState(null);

    const [saving, setSaving] = useState(false);

    // ── Apply transform ───────────────────────────────────────────
    const applyTransform = useCallback(() => {
        if (!innerRef.current) return;
        const s = scaleRef.current;
        const p = panRef.current;
        innerRef.current.style.transform = `translate(${p.x}px, ${p.y}px) scale(${s})`;
    }, []);

    // ── Fit to viewport on mount ──────────────────────────────────
    useEffect(() => {
        if (!viewportRef.current) return;
        const vw = viewportRef.current.clientWidth;
        const vh = viewportRef.current.clientHeight;
        const fitScale = Math.min(vw / mapWidth, vh / mapHeight, 1);
        scaleRef.current = fitScale;
        setScaleDisplay(fitScale);
        // Center
        panRef.current = {
            x: (vw - mapWidth * fitScale) / 2,
            y: (vh - mapHeight * fitScale) / 2
        };
        applyTransform();
    }, [mapWidth, mapHeight, applyTransform]);

    // ── Wheel zoom (Ctrl+scroll or plain scroll) ──────────────────
    useEffect(() => {
        const vp = viewportRef.current;
        if (!vp) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const rect = vp.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const oldScale = scaleRef.current;
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            const newScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldScale + delta));
            if (newScale === oldScale) return;

            // Zoom toward mouse position
            const ratio = newScale / oldScale;
            panRef.current = {
                x: mouseX - (mouseX - panRef.current.x) * ratio,
                y: mouseY - (mouseY - panRef.current.y) * ratio
            };
            scaleRef.current = newScale;
            setScaleDisplay(newScale);
            applyTransform();
        };

        vp.addEventListener('wheel', handleWheel, { passive: false });
        return () => vp.removeEventListener('wheel', handleWheel);
    }, [applyTransform]);

    // ── Mouse pan (middle-click or when not in draw/place mode) ───
    useEffect(() => {
        const vp = viewportRef.current;
        if (!vp) return;

        const handleMouseDown = (e) => {
            // Middle button always pans; left button pans only when no mode active
            if (e.button === 1 || (e.button === 0 && !drawingMode && !placingMode)) {
                // Don't start pan if clicking on an interactive element
                if (e.target.closest('.ume-obstacle-rect, .ume-pin')) return;
                if (drawingMode || placingMode) return;
                isPanningRef.current = true;
                panStartRef.current = { x: e.clientX, y: e.clientY, panX: panRef.current.x, panY: panRef.current.y };
                vp.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        const handleMouseMove = (e) => {
            if (!isPanningRef.current) return;
            panRef.current = {
                x: panStartRef.current.panX + (e.clientX - panStartRef.current.x),
                y: panStartRef.current.panY + (e.clientY - panStartRef.current.y)
            };
            applyTransform();
        };

        const handleMouseUp = () => {
            if (isPanningRef.current) {
                isPanningRef.current = false;
                vp.style.cursor = '';
            }
        };

        vp.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            vp.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [drawingMode, placingMode, applyTransform]);

    // ── Zoom buttons ──────────────────────────────────────────────
    const zoomIn = () => {
        const vp = viewportRef.current;
        if (!vp) return;
        const cx = vp.clientWidth / 2, cy = vp.clientHeight / 2;
        const oldScale = scaleRef.current;
        const newScale = Math.min(ZOOM_MAX, oldScale + ZOOM_STEP);
        const ratio = newScale / oldScale;
        panRef.current = { x: cx - (cx - panRef.current.x) * ratio, y: cy - (cy - panRef.current.y) * ratio };
        scaleRef.current = newScale;
        setScaleDisplay(newScale);
        applyTransform();
    };

    const zoomOut = () => {
        const vp = viewportRef.current;
        if (!vp) return;
        const cx = vp.clientWidth / 2, cy = vp.clientHeight / 2;
        const oldScale = scaleRef.current;
        const newScale = Math.max(ZOOM_MIN, oldScale - ZOOM_STEP);
        const ratio = newScale / oldScale;
        panRef.current = { x: cx - (cx - panRef.current.x) * ratio, y: cy - (cy - panRef.current.y) * ratio };
        scaleRef.current = newScale;
        setScaleDisplay(newScale);
        applyTransform();
    };

    const zoomFit = () => {
        const vp = viewportRef.current;
        if (!vp) return;
        const vw = vp.clientWidth, vh = vp.clientHeight;
        const fitScale = Math.min(vw / mapWidth, vh / mapHeight, 1);
        scaleRef.current = fitScale;
        setScaleDisplay(fitScale);
        panRef.current = { x: (vw - mapWidth * fitScale) / 2, y: (vh - mapHeight * fitScale) / 2 };
        applyTransform();
    };

    // ── Data loading ──────────────────────────────────────────────
    useEffect(() => {
        loadObstacles();
        loadCategories();
        loadBanners();
        loadEntranceExit();
    }, [shopId]);

    const loadObstacles = async () => {
        try {
            const r = await fetch(`/api/shops/${shopId}/obstacles`);
            if (r.ok) setObstacles(await r.json());
        } catch (e) { console.error('Failed to load obstacles:', e); }
    };

    const loadCategories = async () => {
        try {
            const r = await fetch(`/api/shops/${shopId}/categories`);
            if (r.ok) setCategories(await r.json());
        } catch (e) { console.error('Failed to load categories:', e); }
    };

    const loadBanners = async () => {
        try {
            const r = await fetch(`/api/shops/${shopId}/banners`);
            if (r.ok) setBanners(await r.json());
        } catch (e) { console.error('Failed to load banners:', e); }
    };

    const loadEntranceExit = async () => {
        try {
            const r = await fetch(`/api/shops/${shopId}/entrance-exit`);
            if (r.ok) setEntranceExit(await r.json());
        } catch (e) { console.error('Failed to load entrance/exit:', e); }
    };

    // ── Coordinate helpers ────────────────────────────────────────
    const getMapCoordinates = useCallback((clientX, clientY) => {
        if (!viewportRef.current) return null;
        const rect = viewportRef.current.getBoundingClientRect();
        const s = scaleRef.current;
        const p = panRef.current;
        const x = Math.round((clientX - rect.left - p.x) / s);
        const y = Math.round((clientY - rect.top - p.y) / s);
        if (x < 0 || x > mapWidth || y < 0 || y > mapHeight) return null;
        return { x, y };
    }, [mapWidth, mapHeight]);

    const pctLeft = (x) => `${(x / mapWidth) * 100}%`;
    const pctTop = (y) => `${(y / mapHeight) * 100}%`;
    const pctW = (w) => `${(w / mapWidth) * 100}%`;
    const pctH = (h) => `${(h / mapHeight) * 100}%`;

    // ── Obstacle CRUD ─────────────────────────────────────────────
    const deleteObstacle = async (obstacleId) => {
        try {
            const r = await fetch(`/api/shops/${shopId}/obstacles/${obstacleId}`, { method: 'DELETE' });
            if (r.ok) setObstacles(prev => prev.filter(o => o.id !== obstacleId));
        } catch (e) { console.error('Failed to delete obstacle:', e); }
    };

    const createObstacle = async (data) => {
        try {
            const r = await fetch(`/api/shops/${shopId}/obstacles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (r.ok) {
                const obs = await r.json();
                setObstacles(prev => [...prev, obs]);
            } else {
                alert(`${t('common.error')}: ${r.status}`);
            }
        } catch (e) { console.error('Failed to create obstacle:', e); }
    };

    const clearAllObstacles = async () => {
        if (!window.confirm(t('admin.confirm.clear_obstacles'))) return;
        setSaving(true);
        try {
            for (const o of obstacles) {
                await fetch(`/api/shops/${shopId}/obstacles/${o.id}`, { method: 'DELETE' });
            }
            setObstacles([]);
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    // ── Drawing mode (obstacle rectangle) ─────────────────────────
    useEffect(() => {
        if (!overlayRef.current || !drawingMode) return;
        const overlay = overlayRef.current;

        const handleMouseDown = (e) => {
            if (e.button !== 0) return;
            const coords = getMapCoordinates(e.clientX, e.clientY);
            if (!coords) return;
            isDrawingRef.current = true;
            startPointRef.current = coords;

            const rect = document.createElement('div');
            rect.className = 'ume-draw-preview';
            rect.style.cssText = `position:absolute;border:2px dashed ${getColorByType(selectedObstacleType)};background:${getColorByType(selectedObstacleType)};opacity:0.3;pointer-events:none;z-index:20;`;
            rect.style.left = pctLeft(coords.x);
            rect.style.top = pctTop(coords.y);
            rect.style.width = '0%';
            rect.style.height = '0%';
            overlay.appendChild(rect);
            currentRectRef.current = rect;
            e.stopPropagation();
        };

        const handleMouseMove = (e) => {
            if (!isDrawingRef.current || !startPointRef.current || !currentRectRef.current) return;
            const coords = getMapCoordinates(e.clientX, e.clientY);
            if (!coords) return;
            const s = startPointRef.current;
            const x1 = Math.min(s.x, coords.x), y1 = Math.min(s.y, coords.y);
            const x2 = Math.max(s.x, coords.x), y2 = Math.max(s.y, coords.y);
            currentRectRef.current.style.left = pctLeft(x1);
            currentRectRef.current.style.top = pctTop(y1);
            currentRectRef.current.style.width = pctW(x2 - x1);
            currentRectRef.current.style.height = pctH(y2 - y1);
        };

        const handleMouseUp = async (e) => {
            if (!isDrawingRef.current || !startPointRef.current) return;
            const coords = getMapCoordinates(e.clientX, e.clientY);
            if (!coords) return;
            const s = startPointRef.current;
            isDrawingRef.current = false;

            const x = Math.min(s.x, coords.x), y = Math.min(s.y, coords.y);
            const width = Math.abs(coords.x - s.x), height = Math.abs(coords.y - s.y);

            if (currentRectRef.current) { currentRectRef.current.remove(); currentRectRef.current = null; }
            if (width > 5 && height > 5) await createObstacle({ x, y, width, height, type: selectedObstacleType });
            startPointRef.current = null;
        };

        overlay.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            overlay.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (currentRectRef.current) { currentRectRef.current.remove(); currentRectRef.current = null; }
        };
    }, [drawingMode, selectedObstacleType, mapWidth, mapHeight, getMapCoordinates]);

    // ── Category / entrance / exit placement click ────────────────
    const handleOverlayClick = async (e) => {
        if (drawingMode) return;
        if (!placingMode) return;

        const coords = getMapCoordinates(e.clientX, e.clientY);
        if (!coords) return;

        setSaving(true);
        try {
            if (placingMode === 'category' && selectedCategoryId) {
                const r = await fetch(`/api/shops/${shopId}/categories/${selectedCategoryId}/coordinates`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ x_coordinate: coords.x, y_coordinate: coords.y })
                });
                if (r.ok) {
                    const updated = await r.json();
                    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
                }
            } else if (placingMode === 'banner' && selectedBannerId) {
                const r = await fetch(`/api/shops/${shopId}/banners/${selectedBannerId}/coordinates`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ x_coordinate: coords.x, y_coordinate: coords.y })
                });
                if (r.ok) {
                    const updated = await r.json();
                    setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
                }
            } else if (placingMode === 'entrance') {
                const r = await fetch(`/api/shops/${shopId}/entrance-exit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entranceX: coords.x, entranceY: coords.y })
                });
                if (r.ok) setEntranceExit(await r.json());
            } else if (placingMode === 'exit') {
                const r = await fetch(`/api/shops/${shopId}/entrance-exit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exitX: coords.x, exitY: coords.y })
                });
                if (r.ok) setEntranceExit(await r.json());
            }
        } catch (e) {
            console.error('Save failed:', e);
            alert(t('common.error'));
        }
        setSaving(false);
        setPlacingMode(null);
        setSelectedCategoryId(null);
        setSelectedBannerId(null);
    };

    // ── Mode toggling ─────────────────────────────────────────────
    const activateDrawing = () => { setPlacingMode(null); setSelectedCategoryId(null); setSelectedBannerId(null); setDrawingMode(true); };
    const stopDrawing = () => { setDrawingMode(false); };
    const startPlacingCategory = (id) => { setDrawingMode(false); setPlacingMode('category'); setSelectedCategoryId(id); setSelectedBannerId(null); };
    const startPlacingBanner = (id) => { setDrawingMode(false); setPlacingMode('banner'); setSelectedBannerId(id); setSelectedCategoryId(null); };
    const startPlacingEntrance = () => { setDrawingMode(false); setPlacingMode('entrance'); setSelectedCategoryId(null); setSelectedBannerId(null); };
    const startPlacingExit = () => { setDrawingMode(false); setPlacingMode('exit'); setSelectedCategoryId(null); setSelectedBannerId(null); };
    const cancelPlacing = () => { setPlacingMode(null); setSelectedCategoryId(null); setSelectedBannerId(null); };

    const cursorClass = drawingMode ? 'ume-cursor-crosshair' : placingMode ? 'ume-cursor-crosshair' : 'ume-cursor-grab';
    const activeMode = drawingMode ? 'drawing' : placingMode ? 'placing' : null;

    // Inline styles for pin markers
    const pinStyle = (x, y) => ({ position: 'absolute', left: pctLeft(x), top: pctTop(y), zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translate(-50%, calc(-100% + 20px))', pointerEvents: 'auto', cursor: 'pointer', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' });
    const dotStyle = (color) => ({ width: 20, height: 20, borderRadius: '50%', border: '3px solid #fff', background: color, boxSizing: 'border-box' });
    const arrowStyle = (color) => ({ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `7px solid ${color}`, marginTop: -1 });
    const labelStyle = { marginTop: 2, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 2, whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5' };

    return (
        <div className="unified-map-editor">
            {/* ── Toolbar ── */}
            <div className="ume-toolbar">
                <div className="ume-toolbar-row">
                    <div className="ume-section">
                        <h4>{t('admin.obstacles')}</h4>
                        <div className="ume-row">
                            <select value={selectedObstacleType} onChange={e => setSelectedObstacleType(e.target.value)} disabled={!drawingMode}>
                                <option value="shelf">{t('admin.obstacle_types.shelf')}</option>
                                <option value="wall">{t('admin.obstacle_types.wall')}</option>
                                <option value="counter">{t('admin.obstacle_types.counter')}</option>
                                <option value="checkout">{t('admin.obstacle_types.checkout')}</option>
                            </select>
                            {!drawingMode ? (
                                <button className="ume-btn ume-btn-primary" onClick={activateDrawing}>{t('admin.draw')}</button>
                            ) : (
                                <button className="ume-btn ume-btn-danger" onClick={stopDrawing}>{t('admin.done')}</button>
                            )}
                            <button className="ume-btn ume-btn-warning" onClick={clearAllObstacles} disabled={obstacles.length === 0 || saving}>
                                {t('admin.clear')} ({obstacles.length})
                            </button>
                        </div>
                    </div>

                    <div className="ume-section">
                        <h4>{t('admin.entrance_exit')}</h4>
                        <div className="ume-row">
                            <button className={`ume-btn ${placingMode === 'entrance' ? 'ume-btn-danger' : 'ume-btn-success'}`}
                                onClick={placingMode === 'entrance' ? cancelPlacing : startPlacingEntrance} disabled={saving || drawingMode}>
                                🚪 {placingMode === 'entrance' ? t('common.cancel') : t('admin.entrance')}
                            </button>
                            <button className={`ume-btn ${placingMode === 'exit' ? 'ume-btn-danger' : 'ume-btn-success'}`}
                                onClick={placingMode === 'exit' ? cancelPlacing : startPlacingExit} disabled={saving || drawingMode}>
                                🚶 {placingMode === 'exit' ? t('common.cancel') : t('admin.exit')}
                            </button>
                            <span className="ume-coords">
                                {t('admin.entrance')}: {entranceExit.entranceX != null ? `(${Math.round(entranceExit.entranceX)}, ${Math.round(entranceExit.entranceY)})` : '—'}
                                {' | '}
                                {t('admin.exit')}: {entranceExit.exitX != null ? `(${Math.round(entranceExit.exitX)}, ${Math.round(entranceExit.exitY)})` : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Categories list */}
                <div className="ume-categories">
                    <h4>{t('home.categories')} ({categories.length})</h4>
                    <div className="ume-cat-grid">
                        {categories.map(cat => (
                            <div key={cat.id} className={`ume-cat-item ${selectedCategoryId === cat.id ? 'active' : ''} ${cat.x_coordinate != null ? 'placed' : ''}`}>
                                <span className="ume-cat-name">{cat.category_title}</span>
                                <span className="ume-cat-coords">
                                    {cat.x_coordinate != null ? `(${Math.round(cat.x_coordinate)}, ${Math.round(cat.y_coordinate)})` : t('admin.none')}
                                </span>
                                <button className={`ume-btn ume-btn-sm ${selectedCategoryId === cat.id && placingMode === 'category' ? 'ume-btn-danger' : 'ume-btn-outline'}`}
                                    onClick={() => selectedCategoryId === cat.id && placingMode === 'category' ? cancelPlacing() : startPlacingCategory(cat.id)}
                                    disabled={saving || drawingMode}>
                                    {selectedCategoryId === cat.id && placingMode === 'category' ? '✕' : '📍'}
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && <span className="ume-muted">{t('admin.no_categories')}</span>}
                    </div>
                </div>

                <div className="ume-categories">
                    <h4>{t('admin.banners')} ({banners.length})</h4>
                    <div className="ume-cat-grid">
                        {banners.map(banner => (
                            <div key={banner.id} className={`ume-cat-item ${selectedBannerId === banner.id ? 'active' : ''} ${banner.x_coordinate != null ? 'placed' : ''}`}>
                                <span className="ume-cat-name">{banner.title}</span>
                                <span className="ume-cat-coords">
                                    {banner.x_coordinate != null ? `(${Math.round(banner.x_coordinate)}, ${Math.round(banner.y_coordinate)})` : t('admin.none')}
                                </span>
                                <button className={`ume-btn ume-btn-sm ${selectedBannerId === banner.id && placingMode === 'banner' ? 'ume-btn-danger' : 'ume-btn-outline'}`}
                                    onClick={() => selectedBannerId === banner.id && placingMode === 'banner' ? cancelPlacing() : startPlacingBanner(banner.id)}
                                    disabled={saving || drawingMode || !banner.active}
                                    title={banner.active ? t('admin.place_banner') : t('admin.banner_disabled')}>
                                    {selectedBannerId === banner.id && placingMode === 'banner' ? '✕' : '📢'}
                                </button>
                            </div>
                        ))}
                        {banners.length === 0 && <span className="ume-muted">{t('admin.no_banners')}</span>}
                    </div>
                </div>

                {/* Active mode hint */}
                {activeMode && (
                    <div className="ume-hint">
                        {drawingMode && t('admin.hints.draw')}
                        {placingMode === 'category' && <>{t('admin.hints.place_category')} <strong>{categories.find(c => c.id === selectedCategoryId)?.category_title}</strong></>}
                        {placingMode === 'banner' && <>{t('admin.hints.place_banner')} <strong>{banners.find(b => b.id === selectedBannerId)?.title}</strong></>}
                        {placingMode === 'entrance' && t('admin.hints.place_entrance')}
                        {placingMode === 'exit' && t('admin.hints.place_exit')}
                        <button className="ume-btn ume-btn-sm ume-btn-secondary" onClick={() => { stopDrawing(); cancelPlacing(); }} style={{ marginLeft: 12 }}>{t('common.cancel')}</button>
                    </div>
                )}
            </div>

            {/* ── Zoom controls ── */}
            <div style={{ position: 'absolute', right: 20, top: 'auto', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }} className="ume-zoom-controls">
                <button className="ume-btn ume-btn-sm ume-btn-secondary" onClick={zoomIn} title={t('admin.zoom.in')}>+</button>
                <button className="ume-btn ume-btn-sm ume-btn-secondary" onClick={zoomOut} title={t('admin.zoom.out')}>−</button>
                <button className="ume-btn ume-btn-sm ume-btn-secondary" onClick={zoomFit} title={t('admin.zoom.fit')}>{Math.round(scaleDisplay * 100)}%</button>
            </div>

            {/* ── Map viewport (fixed size, CSS transform zoom/pan) ── */}
            <div ref={viewportRef} className={`ume-viewport ${cursorClass}`}
                 style={{ width: '100%', height: '70vh', minHeight: '400px', overflow: 'hidden', background: '#e9ecef', position: 'relative', borderTop: '2px solid #dee2e6' }}>
                <div ref={innerRef} style={{ position: 'absolute', top: 0, left: 0, width: mapWidth, height: mapHeight, transformOrigin: '0 0' }}>
                    <img src={mapImageUrl} alt="Map" style={{ display: 'block', width: mapWidth, height: mapHeight, pointerEvents: 'none', userSelect: 'none' }} draggable={false} />
                    <div ref={overlayRef} onClick={handleOverlayClick}
                         style={{ position: 'absolute', top: 0, left: 0, width: mapWidth, height: mapHeight, zIndex: 10 }}>

                        {/* Obstacle rectangles */}
                        {obstacles.map(obs => (
                            <div key={obs.id} className="ume-obstacle-rect"
                                style={{
                                    position: 'absolute',
                                    left: obs.x, top: obs.y,
                                    width: obs.width, height: obs.height,
                                    borderColor: getColorByType(obs.type),
                                    backgroundColor: getColorByType(obs.type),
                                    opacity: 0.4, border: '2px solid', cursor: 'pointer', zIndex: 15, boxSizing: 'border-box'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!drawingMode && !placingMode) {
                                        if (window.confirm(t('admin.confirm.delete_obstacle', { type: obs.type, x: obs.x, y: obs.y, w: obs.width, h: obs.height }))) {
                                            deleteObstacle(obs.id);
                                        }
                                    }
                                }}
                            />
                        ))}

                        {/* Category markers */}
                        {categories.map(cat => (
                            cat.x_coordinate != null && cat.y_coordinate != null && (
                                <div key={`pin-${cat.id}`} className="ume-pin"
                                    style={pinStyle(cat.x_coordinate, cat.y_coordinate)}
                                    title={`${cat.category_title} (${Math.round(cat.x_coordinate)}, ${Math.round(cat.y_coordinate)})`}
                                    onClick={(e) => { e.stopPropagation(); if (!drawingMode) startPlacingCategory(cat.id); }}>
                                    <div style={dotStyle('#3b82f6')} />
                                    <div style={arrowStyle('#3b82f6')} />
                                    <div style={labelStyle}>{cat.category_title}</div>
                                </div>
                            )
                        ))}

                        {/* Banner markers */}
                        {banners.map(banner => (
                            banner.active && banner.x_coordinate != null && banner.y_coordinate != null && (
                                <div key={`banner-pin-${banner.id}`} className="ume-pin"
                                    style={pinStyle(banner.x_coordinate, banner.y_coordinate)}
                                    title={`${banner.title} (${Math.round(banner.x_coordinate)}, ${Math.round(banner.y_coordinate)})`}
                                    onClick={(e) => { e.stopPropagation(); if (!drawingMode) startPlacingBanner(banner.id); }}>
                                    <div style={dotStyle('#f97316')} />
                                    <div style={arrowStyle('#f97316')} />
                                    <div style={labelStyle}>{banner.title}</div>
                                </div>
                            )
                        ))}

                        {/* Entrance pin */}
                        {entranceExit.entranceX != null && entranceExit.entranceY != null && (
                            <div className="ume-pin" style={pinStyle(entranceExit.entranceX, entranceExit.entranceY)}
                                title={`${t('admin.entrance')} (${Math.round(entranceExit.entranceX)}, ${Math.round(entranceExit.entranceY)})`}>
                                <div style={dotStyle('#22c55e')} />
                                <div style={arrowStyle('#22c55e')} />
                                <div style={labelStyle}>{t('admin.entrance')}</div>
                            </div>
                        )}

                        {/* Exit pin */}
                        {entranceExit.exitX != null && entranceExit.exitY != null && (
                            <div className="ume-pin" style={pinStyle(entranceExit.exitX, entranceExit.exitY)}
                                title={`${t('admin.exit')} (${Math.round(entranceExit.exitX)}, ${Math.round(entranceExit.exitY)})`}>
                                <div style={dotStyle('#ef4444')} />
                                <div style={arrowStyle('#ef4444')} />
                                <div style={labelStyle}>{t('admin.exit')}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedMapEditor;
