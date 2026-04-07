import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function CategorySearch({ categories, onSelect }) {
    const { t } = useTranslation();
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
            name: cat.category?.title || t('search.no_name'),
            category: cat.category?.parent?.title || t('search.general'),
            x: cat.x_coordinate,
            y: cat.y_coordinate
        })).filter(cat => 
            cat.name.toLowerCase().includes(query) ||
            cat.category?.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults(filtered);
    }, [searchQuery, categories]);

    const handleSelectCategory = (category) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        onSelect(category);
    };

    // Full category list for quick-tap when no search query
    const allCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.category?.title || t('search.no_name'),
        category: cat.category?.parent?.title || t('search.general'),
        x: cat.x_coordinate,
        y: cat.y_coordinate
    }));

    return (
        <div className="search-input-wrapper">
            <div style={{ position: 'relative' }}>
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="map-search-input"
                    placeholder={t('search.category_placeholder')}
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
                        {t('search.nothing_found')}
                    </div>
                </div>
            )}

            {/* Show all categories when no search query — quick tap to select */}
            {!isSearching && searchQuery.length < 2 && allCategories.length > 0 && (
                <div className="category-quick-list">
                    {allCategories.map((category, index) => (
                        <div
                            key={index}
                            className="category-quick-item"
                            onClick={() => handleSelectCategory(category)}
                        >
                            <span className="category-quick-icon">📂</span>
                            <span className="category-quick-name">{category.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
