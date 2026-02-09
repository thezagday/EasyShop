import React, { useState, useEffect } from 'react';
import { TrackingService } from '../../../../services/TrackingService';

export function CollectionPicker({ shopId, onSelect }) {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!shopId) return;

        fetch(`/api/shops/${shopId}/collections`)
            .then(r => r.json())
            .then(data => {
                setCollections(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [shopId]);

    const handleSelect = async (collection) => {
        await TrackingService.trackSearch(parseInt(shopId, 10), `Подборка: ${collection.title}`);
        onSelect(collection);
    };

    if (loading) {
        return <div className="collection-loading">Загрузка подборок...</div>;
    }

    if (collections.length === 0) {
        return <div className="collection-empty">Подборки пока не добавлены</div>;
    }

    return (
        <div className="collection-picker">
            {collections.map(col => (
                <div key={col.id} className="collection-card">
                    <div className="collection-card-header">
                        <div className="collection-card-emoji">{col.emoji || '📦'}</div>
                        <div className="collection-card-info">
                            <div className="collection-card-title">{col.title}</div>
                            {col.description && (
                                <div className="collection-card-desc">{col.description}</div>
                            )}
                        </div>
                    </div>
                    <div className="collection-card-items">
                        {col.items.map(item => (
                            <div key={item.id} className="collection-item">
                                <span className="collection-item-dot">•</span>
                                <span className="collection-item-name">{item.commodityTitle}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        className="collection-build-route-btn"
                        onClick={() => handleSelect(col)}
                    >
                        🗺️ Построить маршрут
                    </button>
                </div>
            ))}
        </div>
    );
}
