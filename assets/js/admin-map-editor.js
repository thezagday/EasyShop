import React from 'react';
import { createRoot } from 'react-dom/client';
import UnifiedMapEditor from './components/Admin/UnifiedMapEditor/UnifiedMapEditor';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('map-editor-root');

    if (container) {
        const shopId = parseInt(container.dataset.shopId, 10);
        const mapImageUrl = container.dataset.mapUrl;
        const mapWidth = parseInt(container.dataset.mapWidth, 10);
        const mapHeight = parseInt(container.dataset.mapHeight, 10);

        const root = createRoot(container);
        root.render(
            <UnifiedMapEditor
                shopId={shopId}
                mapImageUrl={mapImageUrl}
                mapWidth={mapWidth}
                mapHeight={mapHeight}
            />
        );
    }
});
