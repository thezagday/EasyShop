import L from 'leaflet';
import i18n from '../../../../i18n';

export class CustomMarker {
    /**
     * @param {Object}  position
     * @param {string}  shopName
     * @param {number}  categoryId
     * @param {Array}   commodities  - list of items to pick up
     * @param {boolean} isTarget     - true = search/route target (🎯), false = regular category (🏪)
     */
    static createShopMarker(position, shopName, categoryId = null, commodities = [], isTarget = false) {
        const emoji = isTarget ? '🎯' : '🏪';
        const markerClass = isTarget ? 'custom-shop-marker target-marker' : 'custom-shop-marker';

        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `
                <div class="${markerClass}">
                    <div class="icon">${emoji}</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker(position, { icon });

        if (categoryId) {
            marker.categoryId = categoryId;
        }

        if (isTarget) {
            // Always show permanent label for target markers (AI-highlighted categories)
            marker.bindTooltip(shopName, {
                permanent: true,
                direction: 'bottom',
                className: 'target-label-tooltip'
            });

            if (commodities && commodities.length > 0) {
                // Also bind popup with commodities list
                const commoditiesHtml = `<div class="shop-popup-commodities">
                        <div class="shop-popup-commodities-title">${i18n.t('markers.take_items')}</div>
                        <ul class="shop-popup-commodities-list">
                            ${commodities.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>`;
                marker.bindPopup(`
                    <div class="shop-popup">
                        <h3>${shopName}</h3>
                        ${commoditiesHtml}
                    </div>
                `);
            }
        } else {
            // Regular category: permanent label + popup with "Построить маршрут"
            marker.bindTooltip(shopName, {
                permanent: true,
                direction: 'bottom',
                className: 'target-label-tooltip'
            });
            marker.bindPopup(`
                <div class="shop-popup">
                    <h3>${shopName}</h3>
                    <button class="shop-popup-button" data-category-id="${categoryId || ''}" data-action="build-route">
                        ${i18n.t('markers.build_route')}
                    </button>
                </div>
            `);
        }

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
            .bindTooltip(i18n.t('shop.entrance'), { 
                permanent: false,
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
            .bindTooltip(i18n.t('shop.exit'), {
                permanent: false,
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
            .bindTooltip(i18n.t('map.you_are_here'), {
                permanent: false,
                direction: 'top',
                className: 'room-tooltip'
            });
    }
}
