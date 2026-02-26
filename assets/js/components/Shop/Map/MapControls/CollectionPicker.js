import React, { useState, useEffect } from 'react';

export function CollectionPicker({ shopId, onSelect }) {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        if (!shopId) {
            setCollections([]);
            setLoading(false);
            return;
        }

        fetch(`/api/shops/${shopId}/collections`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const rawCollections = Array.isArray(data)
                    ? data
                    : (Array.isArray(data?.collections) ? data.collections : []);

                const normalizedCollections = rawCollections
                    .map((collection) => ({
                        ...collection,
                        items: Array.isArray(collection?.items) ? collection.items : []
                    }))
                    .sort((a, b) => Number(Boolean(b?.isPersonal)) - Number(Boolean(a?.isPersonal)));

                setCollections(normalizedCollections);
                setLoading(false);
            })
            .catch(() => {
                setCollections([]);
                setLoading(false);
            });
    }, [shopId]);

    const handleSelect = (collection) => {
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
            {collections.map(col => {
                const items = Array.isArray(col.items) ? col.items : [];
                const hasItems = items.length > 0;

                return (
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
                        {items.map(item => (
                            <div key={item.id} className="collection-item">
                                <span className="collection-item-dot">•</span>
                                <span className="collection-item-name">{item.commodityTitle}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        className="collection-build-route-btn"
                        disabled={!hasItems}
                        title={hasItems ? 'Построить маршрут' : 'В подборке нет товаров с координатами'}
                        onClick={() => handleSelect(col)}
                    >
                        🗺️ Построить маршрут
                    </button>
                </div>
            )})}
        </div>
    );
}
