import React from 'react';
import { createRoot } from 'react-dom/client';
import ObstacleMapEditor from './components/Admin/ObstacleEditor/ObstacleMapEditor';

// Bootstrap admin map editor
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('obstacle-editor-root');
    
    if (!container) {
        console.error('Obstacle editor root element not found');
        return;
    }

    const shopId = parseInt(container.dataset.shopId, 10);
    const mapImageUrl = container.dataset.mapUrl;
    const mapWidth = parseInt(container.dataset.mapWidth, 10);
    const mapHeight = parseInt(container.dataset.mapHeight, 10);

    const root = createRoot(container);
    root.render(
        <ObstacleMapEditor
            shopId={shopId}
            mapImageUrl={mapImageUrl}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
        />
    );
});
