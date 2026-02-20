import React, { useRef, useEffect, useState, useCallback } from 'react';

const NAV_BAR_HEIGHT = 56;
const EXPANDED_RATIO = 0.92;   // 92% of wrapper
const COLLAPSED_RATIO = 0.12;  // 12% of wrapper
const SNAP_THRESHOLD = 0.35;   // drag past 35% → snap to other state

/**
 * BottomSheet with drag-to-resize.
 * States: 'hidden' | 'expanded' | 'collapsed'
 * User can drag between expanded and collapsed via the handle.
 */
export function BottomSheet({ state, title, onClose, onChangeState, children }) {
    const sheetRef = useRef(null);
    const dragRef = useRef({ active: false, startY: 0, startH: 0 });
    const [dragHeight, setDragHeight] = useState(null);

    // Block scroll/click propagation to underlying canvas
    useEffect(() => {
        const el = sheetRef.current;
        if (!el) return;
        const stopWheel = (e) => e.stopPropagation();
        const stopClick = (e) => e.stopPropagation();
        el.addEventListener('wheel', stopWheel, { passive: false });
        el.addEventListener('mousedown', stopClick);
        el.addEventListener('touchstart', stopClick, { passive: true });
        return () => {
            el.removeEventListener('wheel', stopWheel);
            el.removeEventListener('mousedown', stopClick);
            el.removeEventListener('touchstart', stopClick);
        };
    }, []);

    const getWrapperHeight = useCallback(() => {
        const wrapper = sheetRef.current?.parentElement;
        return wrapper ? wrapper.clientHeight - NAV_BAR_HEIGHT : 600;
    }, []);

    const getHeightForState = useCallback((s) => {
        const wh = getWrapperHeight();
        return s === 'expanded' ? wh * EXPANDED_RATIO : wh * COLLAPSED_RATIO;
    }, [getWrapperHeight]);

    // ── Drag handlers ──
    const onDragStart = useCallback((clientY) => {
        const el = sheetRef.current;
        if (!el) return;
        dragRef.current = { active: true, startY: clientY, startH: el.offsetHeight };
        el.style.transition = 'none';
    }, []);

    const onDragMove = useCallback((clientY) => {
        if (!dragRef.current.active) return;
        const delta = dragRef.current.startY - clientY;
        const newH = Math.max(40, dragRef.current.startH + delta);
        setDragHeight(newH);
    }, []);

    const onDragEnd = useCallback(() => {
        if (!dragRef.current.active) return;
        dragRef.current.active = false;
        const el = sheetRef.current;
        if (!el) return;
        el.style.transition = '';

        const wh = getWrapperHeight();
        const currentH = el.offsetHeight;
        const ratio = currentH / wh;

        // Snap to expanded or collapsed
        if (ratio > SNAP_THRESHOLD) {
            onChangeState?.('expanded');
        } else {
            onChangeState?.('collapsed');
        }
        setDragHeight(null);
    }, [getWrapperHeight, onChangeState]);

    // Mouse events
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        onDragStart(e.clientY);
        const onMove = (ev) => onDragMove(ev.clientY);
        const onUp = () => { onDragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [onDragStart, onDragMove, onDragEnd]);

    // Touch events
    const handleTouchStart = useCallback((e) => {
        onDragStart(e.touches[0].clientY);
    }, [onDragStart]);

    const handleTouchMove = useCallback((e) => {
        onDragMove(e.touches[0].clientY);
    }, [onDragMove]);

    const handleTouchEnd = useCallback(() => {
        onDragEnd();
    }, [onDragEnd]);

    if (state === 'hidden') return null;

    const height = dragHeight != null ? dragHeight : getHeightForState(state);

    return (
        <div
            className="bottom-sheet"
            ref={sheetRef}
            style={{ height: height + 'px' }}
        >
            <div
                className="bottom-sheet__header"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="bottom-sheet__handle" />
                <div className="bottom-sheet__title">{title}</div>
                <button className="bottom-sheet__close" onClick={onClose} onMouseDown={e => e.stopPropagation()}>✕</button>
            </div>
            <div className="bottom-sheet__content">
                {children}
            </div>
        </div>
    );
}
