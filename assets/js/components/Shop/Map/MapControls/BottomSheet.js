import React, { useRef, useEffect } from 'react';
import L from 'leaflet';

/**
 * BottomSheet component with three states:
 * - 'hidden'    — not visible
 * - 'expanded'  — covers ~95% of the map area
 * - 'collapsed' — covers ~40% so user can see map results
 */
export function BottomSheet({ state, title, onClose, children }) {
    const sheetRef = useRef(null);

    // Block Leaflet scroll/click propagation inside the sheet
    useEffect(() => {
        const el = sheetRef.current;
        if (!el) return;
        L.DomEvent.disableScrollPropagation(el);
        L.DomEvent.disableClickPropagation(el);
    }, []);

    if (state === 'hidden') return null;

    const stateClass = state === 'expanded' ? 'bottom-sheet--expanded' : 'bottom-sheet--collapsed';

    return (
        <div className={`bottom-sheet ${stateClass}`} ref={sheetRef}>
            <div className="bottom-sheet__header">
                <div className="bottom-sheet__handle" />
                <div className="bottom-sheet__title">{title}</div>
                <button className="bottom-sheet__close" onClick={onClose}>✕</button>
            </div>
            <div className="bottom-sheet__content">
                {children}
            </div>
        </div>
    );
}
