import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import { useAppContext } from '../../context/AppContext';

export default function UserProfile() {
    const { username } = useAppContext();
    const [activeTab, setActiveTab] = useState('context');
    const [userContext, setUserContext] = useState('');
    const [history, setHistory] = useState([]);
    const [collections, setCollections] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [shops, setShops] = useState([]);
    const [shopCommodities, setShopCommodities] = useState([]);
    const [selectedCommodityIds, setSelectedCommodityIds] = useState([]);
    const [commoditySearch, setCommoditySearch] = useState('');
    const [editShopCommodities, setEditShopCommodities] = useState([]);
    const [editSelectedCommodityIds, setEditSelectedCommodityIds] = useState([]);
    const [editCommoditySearch, setEditCommoditySearch] = useState('');
    const [editCommoditiesLoading, setEditCommoditiesLoading] = useState(false);
    const [newCollection, setNewCollection] = useState({
        title: '',
        description: '',
        emoji: '📦',
        shopId: ''
    });

    useEffect(() => {
        loadActiveTabData();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'collections' && shops.length === 0) {
            fetch('/api/shops')
                .then(r => r.json())
                .then(data => setShops(data['hydra:member'] || []))
                .catch(() => {});
        }
    }, [activeTab]);

    useEffect(() => {
        if (newCollection.shopId) {
            fetch(`/api/shops/${newCollection.shopId}/commodities`)
                .then(r => r.json())
                .then(data => setShopCommodities(data.commodities || []))
                .catch(() => setShopCommodities([]));
        } else {
            setShopCommodities([]);
        }
        setSelectedCommodityIds([]);
        setCommoditySearch('');
    }, [newCollection.shopId]);

    const clearEditingState = () => {
        setEditingCollection(null);
        setEditShopCommodities([]);
        setEditSelectedCommodityIds([]);
        setEditCommoditySearch('');
        setEditCommoditiesLoading(false);
    };

    const loadActiveTabData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'context':
                    await loadUserContext();
                    break;
                case 'history':
                    await loadHistory();
                    break;
                case 'collections':
                    await loadCollections();
                    break;
                case 'stats':
                    await loadStats();
                    break;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: 'Ошибка загрузки данных' });
        } finally {
            setLoading(false);
        }
    };

    const loadUserContext = async () => {
        const response = await fetch('/api/user/context');
        if (response.ok) {
            const data = await response.json();
            setUserContext(data.userContext || '');
        }
    };

    const loadHistory = async () => {
        const response = await fetch('/api/user/history?limit=50');
        if (response.ok) {
            const data = await response.json();
            setHistory(data.history || []);
        }
    };

    const loadCollections = async () => {
        const response = await fetch('/api/user/collections');
        if (response.ok) {
            const data = await response.json();
            setCollections(data.collections || []);
        }
    };

    const loadStats = async () => {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
            const data = await response.json();
            setStats(data);
        }
    };

    const saveUserContext = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch('/api/user/context', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userContext })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Контекст сохранён' });
            } else {
                setMessage({ type: 'error', text: 'Ошибка сохранения' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка сохранения' });
        } finally {
            setSaving(false);
        }
    };

    const createCollection = async () => {
        if (!newCollection.title || !newCollection.shopId) {
            setMessage({ type: 'error', text: 'Заполните название и выберите магазин' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch('/api/user/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCollection)
            });

            if (response.ok) {
                const data = await response.json();
                const collectionId = data.collection?.id;

                if (collectionId && selectedCommodityIds.length > 0) {
                    for (const commodityId of selectedCommodityIds) {
                        await fetch(`/api/user/collections/${collectionId}/commodities`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commodityId })
                        });
                    }
                }

                setMessage({ type: 'success', text: 'Подборка создана' });
                setShowCreateCollection(false);
                setNewCollection({ title: '', description: '', emoji: '📦', shopId: '' });
                setSelectedCommodityIds([]);
                setShopCommodities([]);
                await loadCollections();
            } else {
                setMessage({ type: 'error', text: 'Ошибка создания подборки' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка создания подборки' });
        } finally {
            setSaving(false);
        }
    };

    const toggleCommodity = (id) => {
        setSelectedCommodityIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleEditCommodity = (id) => {
        setEditSelectedCommodityIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const startEditingCollection = async (collection) => {
        const currentIds = Array.isArray(collection?.commodities)
            ? collection.commodities
                .map((commodity) => Number.parseInt(commodity?.id, 10))
                .filter((id) => Number.isInteger(id) && id > 0)
            : [];

        setEditingCollection({ ...collection });
        setEditSelectedCommodityIds(currentIds);
        setEditCommoditySearch('');
        setEditShopCommodities([]);
        setEditCommoditiesLoading(true);

        try {
            const response = await fetch(`/api/shops/${collection.shopId}/commodities`);
            if (!response.ok) {
                setEditShopCommodities([]);
                return;
            }

            const data = await response.json();
            setEditShopCommodities(data.commodities || []);
        } catch (_) {
            setEditShopCommodities([]);
        } finally {
            setEditCommoditiesLoading(false);
        }
    };

    const filteredCommodities = shopCommodities.filter(c =>
        c.title.toLowerCase().includes(commoditySearch.toLowerCase())
    );

    const filteredEditCommodities = editShopCommodities.filter(c =>
        c.title.toLowerCase().includes(editCommoditySearch.toLowerCase())
    );

    const updateCollection = async (id, data, nextCommodityIds = null, currentCommodityIds = null) => {
        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch(`/api/user/collections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                if (Array.isArray(nextCommodityIds) && Array.isArray(currentCommodityIds)) {
                    const normalizedNext = nextCommodityIds
                        .map((commodityId) => Number.parseInt(commodityId, 10))
                        .filter((commodityId) => Number.isInteger(commodityId) && commodityId > 0);
                    const normalizedCurrent = currentCommodityIds
                        .map((commodityId) => Number.parseInt(commodityId, 10))
                        .filter((commodityId) => Number.isInteger(commodityId) && commodityId > 0);

                    const nextSet = new Set(normalizedNext);
                    const currentSet = new Set(normalizedCurrent);

                    const toAdd = normalizedNext.filter((commodityId) => !currentSet.has(commodityId));
                    const toRemove = normalizedCurrent.filter((commodityId) => !nextSet.has(commodityId));

                    const syncRequests = [
                        ...toAdd.map((commodityId) => fetch(`/api/user/collections/${id}/commodities`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ commodityId })
                        })),
                        ...toRemove.map((commodityId) => fetch(`/api/user/collections/${id}/commodities/${commodityId}`, {
                            method: 'DELETE'
                        }))
                    ];

                    if (syncRequests.length > 0) {
                        const syncResponses = await Promise.all(syncRequests);
                        const hasSyncError = syncResponses.some((syncResponse) => !syncResponse.ok);
                        if (hasSyncError) {
                            throw new Error('Failed to sync collection commodities');
                        }
                    }
                }

                setMessage({ type: 'success', text: 'Подборка обновлена' });
                clearEditingState();
                await loadCollections();
            } else {
                setMessage({ type: 'error', text: 'Ошибка обновления' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка обновления' });
        } finally {
            setSaving(false);
        }
    };

    const deleteCollection = async (id) => {
        if (!confirm('Удалить эту подборку?')) return;

        setSaving(true);
        setMessage(null);
        try {
            const response = await fetch(`/api/user/collections/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Подборка удалена' });
                if (editingCollection?.id === id) {
                    clearEditingState();
                }
                await loadCollections();
            } else {
                setMessage({ type: 'error', text: 'Ошибка удаления' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка удаления' });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCost = (cost) => {
        return cost ? `${parseFloat(cost).toFixed(2)} ₽` : '—';
    };

    const formatRouteCategories = (routeCategories) => {
        if (!Array.isArray(routeCategories) || routeCategories.length === 0) return '';

        return routeCategories
            .map((point, index) => {
                if (typeof point === 'string') {
                    return point;
                }

                if (point && typeof point === 'object') {
                    return point.name || point.title || `Точка ${index + 1}`;
                }

                return '';
            })
            .filter(Boolean)
            .join(' → ');
    };

    const getReplayWaypoints = (routeCategories) => {
        if (!Array.isArray(routeCategories)) return [];

        return routeCategories
            .map((point) => {
                if (!point || typeof point !== 'object') return null;

                const x = Number(point.x);
                const y = Number(point.y);
                if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

                return {
                    name: point.name || point.title || 'Точка',
                    x,
                    y,
                    categoryId: point.categoryId,
                    commodities: Array.isArray(point.commodities) ? point.commodities : []
                };
            })
            .filter(Boolean);
    };

    const handleViewRouteOnMap = (item) => {
        const replayWaypoints = getReplayWaypoints(item.routeCategories);

        if (replayWaypoints.length >= 2) {
            const storageKey = `eshop:history-route:${item.id}`;
            window.sessionStorage.setItem(storageKey, JSON.stringify({
                shopId: item.shopId,
                waypoints: replayWaypoints
            }));
            window.location.href = `/shop/${item.shopId}?historyActivity=${item.id}`;
            return;
        }

        window.location.href = `/shop/${item.shopId}`;
    };

    return (
        <div className="user-profile">
            <div className="container">
                <div className="profile-header">
                    <h1>Личный кабинет</h1>
                    <p className="profile-username">
                        <i className="fas fa-user"></i> {username}
                    </p>
                </div>

                <div className="profile-tabs">
                    <button
                        className={`profile-tab ${activeTab === 'context' ? 'active' : ''}`}
                        onClick={() => setActiveTab('context')}>
                        <i className="fas fa-user-cog"></i>
                        Мои предпочтения
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}>
                        <i className="fas fa-history"></i>
                        История
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'collections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collections')}>
                        <i className="fas fa-heart"></i>
                        Мои подборки
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}>
                        <i className="fas fa-chart-pie"></i>
                        Статистика
                    </button>
                </div>

                {message && (
                    <div className={`profile-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content">
                    {loading ? (
                        <div className="profile-loading">
                            <i className="fas fa-spinner fa-spin"></i> Загрузка...
                        </div>
                    ) : (
                        <>
                            {activeTab === 'context' && (
                                <div className="profile-section">
                                    <h2>Персональный AI-контекст</h2>
                                    <p className="section-description">
                                        Укажите ваши предпочтения, диету или ограничения. AI-помощник будет учитывать это при подборе товаров.
                                    </p>
                                    <textarea
                                        className="context-input"
                                        placeholder="Например: Избегай молочки, так как у меня непереносимость лактозы. Предпочитаю органические продукты."
                                        value={userContext}
                                        onChange={(e) => setUserContext(e.target.value)}
                                        rows={6}
                                    />
                                    <button
                                        className="btn-save"
                                        onClick={saveUserContext}
                                        disabled={saving}>
                                        {saving ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="profile-section">
                                    <h2>История покупок и маршрутов</h2>
                                    {history.length === 0 ? (
                                        <p className="empty-state">История пуста</p>
                                    ) : (
                                        <div className="history-list">
                                            {history.map((item) => {
                                                const routeLabel = formatRouteCategories(item.routeCategories);
                                                const canReplayRoute = getReplayWaypoints(item.routeCategories).length >= 2;

                                                return (
                                                    <div key={item.id} className="history-item">
                                                        <div className="history-header">
                                                            <a href={`/shop/${item.shopId}`} className="history-shop">{item.shopTitle}</a>
                                                            <span className="history-date">{formatDate(item.createdAt)}</span>
                                                        </div>
                                                        {item.query && (
                                                            <div className="history-query">
                                                                <i className="fas fa-comment"></i> {item.query}
                                                            </div>
                                                        )}
                                                        {routeLabel && (
                                                            <div className="history-route">
                                                                <i className="fas fa-route"></i> Маршрут: {routeLabel}
                                                            </div>
                                                        )}
                                                        {item.purchasedItems && item.purchasedItems.length > 0 && (
                                                            <div className="history-products">
                                                                <i className="fas fa-shopping-basket"></i> Товары: {item.purchasedItems.join(', ')}
                                                            </div>
                                                        )}
                                                        <div className="history-stats">
                                                            {item.routeDistance && (
                                                                <span><i className="fas fa-walking"></i> {item.routeDistance}м</span>
                                                            )}
                                                            {item.routeTime && (
                                                                <span><i className="fas fa-clock"></i> {item.routeTime}мин</span>
                                                            )}
                                                            {item.routeCost && (
                                                                <span><i className="fas fa-ruble-sign"></i> {formatCost(item.routeCost)}</span>
                                                            )}
                                                        </div>
                                                        {routeLabel && (
                                                            <div className="history-actions">
                                                                <button
                                                                    className="btn-view-route"
                                                                    onClick={() => handleViewRouteOnMap(item)}
                                                                    disabled={!canReplayRoute}
                                                                    title={canReplayRoute ? 'Открыть маршрут на карте' : 'Для старых записей маршрут недоступен'}
                                                                >
                                                                    <i className="fas fa-map-marked-alt"></i> Посмотреть на карте
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'collections' && (
                                <div className="profile-section">
                                    <div className="section-header">
                                        <h2>Мои подборки товаров</h2>
                                        <button 
                                            className="btn-create-collection"
                                            onClick={() => setShowCreateCollection(true)}>
                                            <i className="fas fa-plus"></i> Создать подборку
                                        </button>
                                    </div>

                                    {showCreateCollection && (
                                        <div className="create-collection-form">
                                            <h3>Новая подборка</h3>
                                            <div className="form-group">
                                                <label htmlFor="new-collection-shop">Магазин</label>
                                                <div className="select-modern-wrap">
                                                    <select
                                                        id="new-collection-shop"
                                                        name="newCollectionShop"
                                                        className="form-control form-control--select"
                                                        value={newCollection.shopId}
                                                        onChange={(e) => setNewCollection({...newCollection, shopId: e.target.value})}>
                                                        <option value="">-- Выберите магазин --</option>
                                                        {shops.map(shop => (
                                                            <option key={shop.id} value={shop.id}>{shop.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Название</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newCollection.title}
                                                    onChange={(e) => setNewCollection({...newCollection, title: e.target.value})}
                                                    placeholder="Например: Завтрак на неделю"
                                                />
                                            </div>
                                            <div className="form-row">
                                                <div className="form-group">
                                                    <label>Описание</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={newCollection.description}
                                                        onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                                                        placeholder="Краткое описание"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Emoji</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={newCollection.emoji}
                                                        onChange={(e) => setNewCollection({...newCollection, emoji: e.target.value})}
                                                        placeholder="📦"
                                                        style={{maxWidth: '80px'}}
                                                    />
                                                </div>
                                            </div>

                                            {newCollection.shopId && (
                                                <div className="form-group">
                                                    <label>Товары ({selectedCommodityIds.length} выбрано)</label>
                                                    <input
                                                        type="text"
                                                        className="form-control commodity-search"
                                                        value={commoditySearch}
                                                        onChange={(e) => setCommoditySearch(e.target.value)}
                                                        placeholder="Поиск товаров..."
                                                    />
                                                    <div className="commodity-picker">
                                                        {filteredCommodities.length === 0 ? (
                                                            <div className="commodity-picker-empty">
                                                                {shopCommodities.length === 0 ? 'Загрузка товаров...' : 'Ничего не найдено'}
                                                            </div>
                                                        ) : (
                                                            filteredCommodities.map(c => (
                                                                <label key={c.id} className={`commodity-picker-item ${selectedCommodityIds.includes(c.id) ? 'selected' : ''}`}>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`new-collection-commodity-${c.id}`}
                                                                        name="newCollectionCommodityIds"
                                                                        checked={selectedCommodityIds.includes(c.id)}
                                                                        onChange={() => toggleCommodity(c.id)}
                                                                    />
                                                                    <span className="commodity-main">
                                                                        <span className="commodity-title">{c.title}</span>
                                                                        <span className="commodity-meta">
                                                                            {c.categoryTitle && <span className="commodity-category">{c.categoryTitle}</span>}
                                                                            {c.price && <span className="commodity-price">{c.price} ₽</span>}
                                                                        </span>
                                                                    </span>
                                                                </label>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="form-actions">
                                                <button 
                                                    className="btn-save"
                                                    onClick={createCollection}
                                                    disabled={saving}>
                                                    {saving ? 'Создание...' : 'Создать'}
                                                </button>
                                                <button 
                                                    className="btn-cancel"
                                                    onClick={() => {
                                                        setShowCreateCollection(false);
                                                        setNewCollection({ title: '', description: '', emoji: '📦', shopId: '' });
                                                        setSelectedCommodityIds([]);
                                                        setShopCommodities([]);
                                                    }}>
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {collections.length === 0 ? (
                                        <p className="empty-state">
                                            {showCreateCollection ? '' : 'У вас пока нет подборок. Создайте первую!'}
                                        </p>
                                    ) : (
                                        <div className="collections-grid">
                                            {collections.map((collection) => (
                                                <div key={collection.id} className="collection-card">
                                                    {editingCollection?.id === collection.id ? (
                                                        <div className="edit-collection-form">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editingCollection.title}
                                                                onChange={(e) => setEditingCollection({...editingCollection, title: e.target.value})}
                                                                placeholder="Название"
                                                            />
                                                            <textarea
                                                                className="form-control"
                                                                value={editingCollection.description || ''}
                                                                onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})}
                                                                placeholder="Описание"
                                                                rows="2"
                                                            />
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editingCollection.emoji || ''}
                                                                onChange={(e) => setEditingCollection({...editingCollection, emoji: e.target.value})}
                                                                placeholder="Emoji"
                                                            />
                                                            <div className="form-group">
                                                                <label>Товары ({editSelectedCommodityIds.length} выбрано)</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control commodity-search"
                                                                    value={editCommoditySearch}
                                                                    onChange={(e) => setEditCommoditySearch(e.target.value)}
                                                                    placeholder="Поиск товаров..."
                                                                />
                                                                <div className="commodity-picker">
                                                                    {editCommoditiesLoading ? (
                                                                        <div className="commodity-picker-empty">Загрузка товаров...</div>
                                                                    ) : filteredEditCommodities.length === 0 ? (
                                                                        <div className="commodity-picker-empty">
                                                                            {editShopCommodities.length === 0 ? 'Товары не найдены для магазина' : 'Ничего не найдено'}
                                                                        </div>
                                                                    ) : (
                                                                        filteredEditCommodities.map(c => (
                                                                            <label key={c.id} className={`commodity-picker-item ${editSelectedCommodityIds.includes(c.id) ? 'selected' : ''}`}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`edit-collection-${collection.id}-commodity-${c.id}`}
                                                                                    name={`editCollectionCommodityIds-${collection.id}`}
                                                                                    checked={editSelectedCommodityIds.includes(c.id)}
                                                                                    onChange={() => toggleEditCommodity(c.id)}
                                                                                />
                                                                                <span className="commodity-main">
                                                                                    <span className="commodity-title">{c.title}</span>
                                                                                    <span className="commodity-meta">
                                                                                        {c.categoryTitle && <span className="commodity-category">{c.categoryTitle}</span>}
                                                                                        {c.price && <span className="commodity-price">{c.price} ₽</span>}
                                                                                    </span>
                                                                                </span>
                                                                            </label>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="collection-edit-actions">
                                                                <button 
                                                                    className="btn-save-small"
                                                                    onClick={() => updateCollection(collection.id, {
                                                                        title: editingCollection.title,
                                                                        description: editingCollection.description,
                                                                        emoji: editingCollection.emoji
                                                                    }, editSelectedCommodityIds, (collection.commodities || []).map((commodity) => commodity.id))}
                                                                    disabled={saving}>
                                                                    Сохранить
                                                                </button>
                                                                <button 
                                                                    className="btn-cancel-small"
                                                                    onClick={clearEditingState}>
                                                                    Отмена
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="collection-header">
                                                                {collection.emoji && (
                                                                    <span className="collection-emoji">{collection.emoji}</span>
                                                                )}
                                                                <h3>{collection.title}</h3>
                                                            </div>
                                                            {collection.description && (
                                                                <p className="collection-description">{collection.description}</p>
                                                            )}
                                                            {Array.isArray(collection.commodities) && collection.commodities.length > 0 && (
                                                                <div className="collection-items-preview">
                                                                    <i className="fas fa-list-ul"></i>
                                                                    <span>
                                                                        {collection.commodities.slice(0, 4).map((commodity) => commodity.title).join(', ')}
                                                                        {collection.commodities.length > 4 ? ` +${collection.commodities.length - 4}` : ''}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="collection-meta">
                                                                <span><i className="fas fa-store"></i> ID магазина: {collection.shopId}</span>
                                                                <span><i className="fas fa-box"></i> {collection.commodityCount} товаров</span>
                                                            </div>
                                                            <div className="collection-actions">
                                                                <button 
                                                                    className="btn-edit"
                                                                    onClick={() => startEditingCollection(collection)}>
                                                                    <i className="fas fa-edit"></i> Редактировать
                                                                </button>
                                                                <button 
                                                                    className="btn-delete"
                                                                    onClick={() => deleteCollection(collection.id)}>
                                                                    <i className="fas fa-trash"></i> Удалить
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'stats' && (
                                <div className="profile-section">
                                    <h2>Статистика расходов</h2>
                                    {!stats ? (
                                        <p className="empty-state">Нет данных для отображения</p>
                                    ) : (
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-route"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{stats.totalRoutes}</div>
                                                <div className="stat-label">Всего маршрутов</div>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-ruble-sign"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{formatCost(stats.totalCost)}</div>
                                                <div className="stat-label">Всего потрачено</div>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-shopping-cart"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{formatCost(stats.averageCost)}</div>
                                                <div className="stat-label">Средний чек</div>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-walking"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{stats.totalDistanceMeters}м</div>
                                                <div className="stat-label">Всего пройдено</div>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-clock"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{stats.totalTimeMinutes}мин</div>
                                                <div className="stat-label">Всего времени</div>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-stopwatch"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-value">{stats.averageTimeMinutes}мин</div>
                                                <div className="stat-label">Среднее время</div>
                                            </div>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
