import React, { useState, useEffect } from 'react';

export function SearchControl({ shops, onShopSelect }) {
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
        const filtered = shops.filter(shop => 
            shop.name.toLowerCase().includes(query) ||
            shop.category?.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults(filtered);
    }, [searchQuery, shops]);

    const handleSelectShop = (shop) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        onShopSelect(shop);
    };

    return (
        <div className="map-search-container">
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
                    {searchResults.map((shop, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                            onClick={() => handleSelectShop(shop)}
                        >
                            <div className="search-result-name">{shop.name}</div>
                            <div className="search-result-category">{shop.category || 'Общее'}</div>
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
