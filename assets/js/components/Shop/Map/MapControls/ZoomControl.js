import React from 'react';

export function ZoomControl({ map }) {
    const handleZoomIn = () => {
        if (map) {
            map.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (map) {
            map.zoomOut();
        }
    };

    const handleResetView = () => {
        if (map) {
            const bounds = [[0, 0], [993, 1653]];
            map.fitBounds(bounds, { padding: [60, 60] });
        }
    };

    return (
        <div className="custom-zoom-controls">
            <button 
                className="zoom-button" 
                onClick={handleZoomIn}
                title="Приблизить"
            >
                +
            </button>
            <button 
                className="zoom-button" 
                onClick={handleZoomOut}
                title="Отдалить"
            >
                −
            </button>
            <button 
                className="zoom-button" 
                onClick={handleResetView}
                title="Вся карта"
                style={{ fontSize: '18px' }}
            >
                ⊡
            </button>
        </div>
    );
}
