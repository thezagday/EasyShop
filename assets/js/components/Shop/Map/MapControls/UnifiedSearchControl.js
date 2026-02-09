import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { ProductSearch } from './ProductSearch';
import { CategorySearch } from './CategorySearch';
import { AIAssistant } from './AIAssistant';
import { CollectionPicker } from './CollectionPicker';

export function UnifiedSearchControl({ 
    shopId,
    categories, 
    products = [],
    onCategorySelect, 
    onProductSelect,
    onAIResult,
    onCollectionSelect
}) {
    const [searchMode, setSearchMode] = useState('ai'); // ai | category | product
    const containerRef = useRef(null);

    // Блокируем перехват scroll/wheel/click Leaflet-ом внутри панели
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        L.DomEvent.disableScrollPropagation(el);
        L.DomEvent.disableClickPropagation(el);
    }, []);

    const modes = [
        { id: 'ai', label: 'AI помощник', icon: '🤖' },
        { id: 'collection', label: 'Подборки', icon: '🎁' },
        { id: 'product', label: 'Товар', icon: '🛒' },
        { id: 'category', label: 'Категория', icon: '📂' }
    ];

    return (
        <div className="unified-search-container" ref={containerRef}>
            {/* Табы переключения режимов */}
            <div className="search-mode-tabs">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        className={`search-mode-tab ${searchMode === mode.id ? 'active' : ''}`}
                        onClick={() => setSearchMode(mode.id)}
                    >
                        <span className="mode-icon">{mode.icon}</span>
                        <span className="mode-label">{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Контент в зависимости от режима */}
            <div className="search-mode-content">
                {searchMode === 'category' && (
                    <CategorySearch 
                        shopId={shopId}
                        categories={categories} 
                        onSelect={onCategorySelect} 
                    />
                )}
                
                {searchMode === 'product' && (
                    <ProductSearch 
                        shopId={shopId}
                        onSelect={onProductSelect} 
                    />
                )}
                
                {searchMode === 'ai' && (
                    <AIAssistant 
                        shopId={shopId}
                        onResult={onAIResult} 
                    />
                )}
                
                {searchMode === 'collection' && (
                    <CollectionPicker 
                        shopId={shopId}
                        onSelect={onCollectionSelect} 
                    />
                )}
            </div>
        </div>
    );
}
