import React, { useState } from 'react';
import { ProductSearch } from './ProductSearch';
import { CategorySearch } from './CategorySearch';
import { AIAssistant } from './AIAssistant';
import { CollectionPicker } from './CollectionPicker';
import { BottomNavBar } from './BottomNavBar';
import { BottomSheet } from './BottomSheet';
import { TrackingService } from '../../../../services/TrackingService';

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
    // AI chat messages — lifted here so they persist across tab switches
    const [aiMessages, setAIMessages] = useState([]);

    const handleToggle = (sheetId) => {
        if (activeSheet === sheetId && sheetState !== 'hidden') {
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

    // Drag-to-resize callback from BottomSheet
    const handleChangeState = (newState) => {
        setSheetState(newState);
    };

    // Search: hide sheet completely on category/product select
    const handleCategorySelect = (category) => {
        TrackingService.trackSearch(shopId, category?.name || 'Категория');
        handleHide();
        onCategorySelect(category);
    };

    const handleProductSelect = (product) => {
        TrackingService.trackSearch(shopId, product?.name || 'Товар');
        handleHide();
        onProductSelect(product);
    };

    // AI: keep chat expanded so user sees the response first;
    // only collapse when user explicitly clicks "Построить маршрут"
    const handleAIResult = (result) => {
        if (result.buildRoute) {
            handleCollapse();
        }
        onAIResult(result);
    };

    // Collection: hide (route is built immediately)
    const handleCollectionSelect = async (collection) => {
        await TrackingService.trackSearch(shopId, `Подборка: ${collection?.title || 'Без названия'}`);
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
                onChangeState={handleChangeState}
            >
                <AIAssistant
                    shopId={shopId}
                    onResult={handleAIResult}
                    messages={aiMessages}
                    setMessages={setAIMessages}
                />
            </BottomSheet>

            <BottomSheet
                state={activeSheet === 'search' ? sheetState : 'hidden'}
                title={sheetTitles.search}
                onClose={handleClose}
                onChangeState={handleChangeState}
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
                onChangeState={handleChangeState}
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
