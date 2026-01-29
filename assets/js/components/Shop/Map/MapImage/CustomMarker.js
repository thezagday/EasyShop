import L from 'leaflet';

export class CustomMarker {
    static createShopMarker(position, shopName, category, categoryId = null) {
        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `
                <div class="custom-shop-marker">
                    <div class="icon">🏪</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker(position, { icon });
        
        // Сохраняем categoryId в маркере для дальнейшего использования
        if (categoryId) {
            marker.categoryId = categoryId;
        }
        
        marker.bindPopup(`
            <div class="shop-popup">
                <h3>${shopName}</h3>
                <div class="shop-popup-info">
                    <div class="shop-popup-row">
                        <span class="shop-popup-icon">📂</span>
                        <span>${category}</span>
                    </div>
                </div>
                <button class="shop-popup-button" data-category-id="${categoryId || ''}" data-action="build-route">
                    Построить маршрут
                </button>
            </div>
        `);

        marker.bindTooltip(shopName, {
            permanent: false,
            direction: 'top',
            className: 'room-tooltip'
        });

        return marker;
    }

    static createEntranceMarker(position) {
        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `
                <div class="custom-shop-marker entrance-marker">
                    <div class="icon">🚪</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        return L.marker(position, { icon })
            .bindTooltip('Вход', { 
                permanent: true,
                direction: 'top',
                className: 'room-tooltip'
            });
    }

    static createExitMarker(position) {
        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `
                <div class="custom-shop-marker exit-marker">
                    <div class="icon">🚶</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        return L.marker(position, { icon })
            .bindTooltip('Выход', {
                permanent: true,
                direction: 'top',
                className: 'room-tooltip'
            });
    }

    static createCurrentLocationMarker(position) {
        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `<div class="you-are-here"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        return L.marker(position, { icon })
            .bindTooltip('Вы здесь', {
                permanent: false,
                direction: 'top',
                className: 'room-tooltip'
            });
    }
}
