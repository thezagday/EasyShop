import React, { useState } from 'react';
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
    const [searchMode, setSearchMode] = useState('category'); // category | product | ai

    const modes = [
        { id: 'category', label: '📂 Категория', icon: '📂' },
        { id: 'product', label: '🛒 Товар', icon: '🛒' },
        { id: 'ai', label: '🤖 AI помощник', icon: '🤖' }
    ];

    return (
        <div className="unified-search-container">
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
