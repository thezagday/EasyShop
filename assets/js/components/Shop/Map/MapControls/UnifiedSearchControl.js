import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { ProductSearch } from './ProductSearch';
import { CategorySearch } from './CategorySearch';
import { AIAssistant } from './AIAssistant';

export function UnifiedSearchControl({ 
    shopId,
    categories, 
    products = [],
    onCategorySelect, 
    onProductSelect,
    onAIResult
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
        { id: 'ai', label: 'AI \u043f\u043e\u043c\u043e\u0449\u043d\u0438\u043a', icon: '\ud83e\udd16' },
        { id: 'product', label: '\u0422\u043e\u0432\u0430\u0440', icon: '\ud83d\uded2' },
        { id: 'category', label: '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f', icon: '\ud83d\udcc2' }
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
            </div>
        </div>
    );
}
