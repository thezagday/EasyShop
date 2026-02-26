let currentActivityId = null;

function normalizeShopId(shopId) {
    const normalized = Number.parseInt(shopId, 10);
    return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function normalizeQuery(query) {
    if (typeof query !== 'string') return '';
    return query.trim();
}

function normalizeWaypoint(waypoint, index) {
    if (typeof waypoint === 'string') {
        const name = waypoint.trim();
        return name ? { name } : null;
    }

    if (!waypoint || typeof waypoint !== 'object') return null;

    const nameSource = waypoint.title || waypoint.name || `Точка ${index + 1}`;
    const normalized = { name: String(nameSource) };

    const x = Number(waypoint.x);
    const y = Number(waypoint.y);
    if (Number.isFinite(x)) normalized.x = x;
    if (Number.isFinite(y)) normalized.y = y;

    const categoryId = Number.parseInt(waypoint.categoryId, 10);
    if (Number.isInteger(categoryId) && categoryId > 0) {
        normalized.categoryId = categoryId;
    }

    if (Array.isArray(waypoint.commodities)) {
        const commodities = waypoint.commodities
            .filter((item) => typeof item === 'string' && item.trim() !== '')
            .map((item) => item.trim());
        if (commodities.length > 0) {
            normalized.commodities = commodities;
        }
    }

    return normalized;
}

export const TrackingService = {
    trackSearch(shopId, query) {
        const normalizedShopId = normalizeShopId(shopId);
        const normalizedQuery = normalizeQuery(query);

        if (!normalizedShopId || !normalizedQuery) {
            return Promise.resolve();
        }

        return fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId: normalizedShopId, query: normalizedQuery }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.id) {
                    currentActivityId = data.id;
                }
            })
            .catch(() => {});
    },

    trackRoute(shopId, categories, distanceMeters, timeMinutes) {
        if (!currentActivityId) return;

        const normalizedWaypoints = Array.isArray(categories)
            ? categories.map((waypoint, index) => normalizeWaypoint(waypoint, index)).filter(Boolean)
            : [];

        fetch(`/api/track/${currentActivityId}/route`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                categories: normalizedWaypoints,
                distanceMeters,
                timeMinutes,
            }),
        }).catch(() => {});
    },

    getCurrentActivityId() {
        return currentActivityId;
    },

    resetActivity() {
        currentActivityId = null;
    },
};
