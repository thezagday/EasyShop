import React from 'react';
import { useTranslation } from 'react-i18next';

export function ZoomControl({ map }) {
    const { t } = useTranslation();
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
                title={t('map.zoom_in')}
            >
                +
            </button>
            <button 
                className="zoom-button" 
                onClick={handleZoomOut}
                title={t('map.zoom_out')}
            >
                −
            </button>
            <button 
                className="zoom-button" 
                onClick={handleResetView}
                title={t('map.entire_map')}
                style={{ fontSize: '18px' }}
            >
                ⊡
            </button>
        </div>
    );
}
