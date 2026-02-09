import React, { useState, useEffect } from 'react';
import { TrackingService } from '../../../../services/TrackingService';

export function CategorySearch({ shopId, categories, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const query = searchQuery.toLowerCase();
        const filtered = categories.map(cat => ({
            id: cat.id,
            name: cat.category?.title || 'Без названия',
            category: cat.category?.parent?.title || 'Общее',
            x: cat.x_coordinate,
            y: cat.y_coordinate
        })).filter(cat => 
            cat.name.toLowerCase().includes(query) ||
            cat.category?.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults(filtered);
    }, [searchQuery, categories]);

    const handleSelectCategory = (category) => {
        TrackingService.trackSearch(shopId, category.name);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        onSelect(category);
    };

    return (
        <div className="search-input-wrapper">
            <div style={{ position: 'relative' }}>
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="map-search-input"
                    placeholder="Поиск категории..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            {isSearching && searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((category, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                            onClick={() => handleSelectCategory(category)}
                        >
                            <div className="search-result-name">{category.name}</div>
                            <div className="search-result-category">{category.category}</div>
                        </div>
                    ))}
                </div>
            )}
            
            {isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="search-results">
                    <div className="search-result-item" style={{ cursor: 'default', color: '#a0aec0' }}>
                        Ничего не найдено
                    </div>
                </div>
            )}
        </div>
    );
}
