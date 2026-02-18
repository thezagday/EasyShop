import React, { useState } from 'react';
import { ProductSearch } from './ProductSearch';
import { CategorySearch } from './CategorySearch';
import { AIAssistant } from './AIAssistant';
import { CollectionPicker } from './CollectionPicker';
import { BottomNavBar } from './BottomNavBar';
import { BottomSheet } from './BottomSheet';

export function UnifiedSearchControl({ 
    shopId,
    categories, 
    products = [],
    onCategorySelect, 
    onProductSelect,
    onAIResult,
    onCollectionSelect
}) {
    // Which sheet is open: 'ai' | 'search' | 'collection' | null
    const [activeSheet, setActiveSheet] = useState(null);
    // Sheet state: 'hidden' | 'expanded' | 'collapsed'
    const [sheetState, setSheetState] = useState('hidden');
    // Search sub-mode: 'category' | 'product'
    const [searchMode, setSearchMode] = useState('category');

    const handleToggle = (sheetId) => {
        if (activeSheet === sheetId && sheetState !== 'hidden') {
            // Tap same icon → close
            setSheetState('hidden');
            setActiveSheet(null);
        } else {
            setActiveSheet(sheetId);
            setSheetState('expanded');
        }
    };

    const handleClose = () => {
        setSheetState('hidden');
        setActiveSheet(null);
    };

    const handleCollapse = () => {
        setSheetState('collapsed');
    };

    const handleHide = () => {
        setSheetState('hidden');
        setActiveSheet(null);
    };

    // Wrap category select: collapse sheet, then call parent
    const handleCategorySelect = (category) => {
        handleCollapse();
        onCategorySelect(category);
    };

    // Wrap product select: collapse sheet, then call parent
    const handleProductSelect = (product) => {
        handleCollapse();
        onProductSelect(product);
    };

    // Wrap AI result: collapse on results, hide on route build
    const handleAIResult = (result) => {
        if (result.buildRoute) {
            handleHide();
        } else {
            handleCollapse();
        }
        onAIResult(result);
    };

    // Wrap collection select: hide (route is built immediately)
    const handleCollectionSelect = (collection) => {
        handleHide();
        onCollectionSelect(collection);
    };

    const sheetTitles = {
        ai: 'AI помощник',
        search: 'Поиск',
        collection: 'Подборки',
    };

    return (
        <>
            {/* Bottom sheets */}
            <BottomSheet
                state={activeSheet === 'ai' ? sheetState : 'hidden'}
                title={sheetTitles.ai}
                onClose={handleClose}
            >
                <AIAssistant
                    shopId={shopId}
                    onResult={handleAIResult}
                />
            </BottomSheet>

            <BottomSheet
                state={activeSheet === 'search' ? sheetState : 'hidden'}
                title={sheetTitles.search}
                onClose={handleClose}
            >
                <div className="search-switcher">
                    <button
                        className={`search-switcher-btn ${searchMode === 'category' ? 'search-switcher-btn--active' : ''}`}
                        onClick={() => setSearchMode('category')}
                    >
                        Категории
                    </button>
                    <button
                        className={`search-switcher-btn ${searchMode === 'product' ? 'search-switcher-btn--active' : ''}`}
                        onClick={() => setSearchMode('product')}
                    >
                        Товары
                    </button>
                </div>
                {searchMode === 'category' ? (
                    <CategorySearch
                        shopId={shopId}
                        categories={categories}
                        onSelect={handleCategorySelect}
                    />
                ) : (
                    <ProductSearch
                        shopId={shopId}
                        onSelect={handleProductSelect}
                    />
                )}
            </BottomSheet>

            <BottomSheet
                state={activeSheet === 'collection' ? sheetState : 'hidden'}
                title={sheetTitles.collection}
                onClose={handleClose}
            >
                <CollectionPicker
                    shopId={shopId}
                    onSelect={handleCollectionSelect}
                />
            </BottomSheet>

            {/* Bottom navigation bar — always visible */}
            <BottomNavBar activeSheet={activeSheet} onToggle={handleToggle} />
        </>
    );
}
