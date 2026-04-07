import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export function ProductSearch({ shopId, onSelect }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            if (abortRef.current) abortRef.current.abort();
            return;
        }

        setIsSearching(true);
        
        // Debounce search
        const timeoutId = setTimeout(() => {
            searchProducts(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const searchProducts = async (query) => {
        // Отменяем предыдущий запрос
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        try {
            const response = await fetch(`/api/commodities?title=${encodeURIComponent(query)}&shopCategories.shop=${shopId}`, {
                signal: abortRef.current.signal
            });
            const data = await response.json();
            
            const results = (data['hydra:member'] || []).slice(0, 5).map(product => {
                // shopCategories is ManyToMany - get first category
                const firstCategory = product.shopCategories && product.shopCategories.length > 0 
                    ? product.shopCategories[0] 
                    : null;
                
                return {
                    id: product.id,
                    name: product.title,
                    category: firstCategory?.category?.title || t('search.no_category'),
                    categoryId: firstCategory?.id,
                    x: firstCategory?.x_coordinate,
                    y: firstCategory?.y_coordinate,
                    price: product.price
                };
            });
            
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
            setSearchResults([]);
        }
        setLoading(false);
    };

    const handleSelectProduct = (product) => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        onSelect(product);
    };

    return (
        <div className="search-input-wrapper">
            <div style={{ position: 'relative' }}>
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    className="map-search-input"
                    placeholder={t('search.product_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            {loading && (
                <div className="search-results">
                    <div className="search-result-item" style={{ cursor: 'default', color: '#a0aec0' }}>
                        {t('common.search')}
                    </div>
                </div>
            )}
            
            {isSearching && !loading && searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((product, index) => (
                        <div
                            key={index}
                            className="search-result-item"
                            onClick={() => handleSelectProduct(product)}
                        >
                            <div className="search-result-name">
                                {product.name}
                                {product.price && (
                                    <span style={{ float: 'right', color: '#667eea', fontWeight: 'bold' }}>
                                        {product.price} ₽
                                    </span>
                                )}
                            </div>
                            <div className="search-result-category">📍 {product.category}</div>
                        </div>
                    ))}
                </div>
            )}
            
            {isSearching && !loading && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="search-results">
                    <div className="search-result-item" style={{ cursor: 'default', color: '#a0aec0' }}>
                        {t('search.products_not_found')}
                    </div>
                </div>
            )}
        </div>
    );
}
