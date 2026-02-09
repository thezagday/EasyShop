let currentActivityId = null;

export const TrackingService = {
    trackSearch(shopId, query) {
        return fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopId: parseInt(shopId, 10), query }),
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

        fetch(`/api/track/${currentActivityId}/route`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                categories: categories.map(c => c.title || c.name || 'Category'),
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
