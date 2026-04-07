import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Bottom navigation bar with 3 icons: AI Chat, Search, Collections
 */
export function BottomNavBar({ activeSheet, onToggle }) {
    const { t } = useTranslation();
    const items = [
        { id: 'ai', icon: '🤖', label: t('nav.ai') },
        { id: 'search', icon: '🔍', label: t('nav.search') },
        { id: 'collection', icon: '🎁', label: t('nav.collections') },
    ];

    return (
        <div className="bottom-nav-bar">
            {items.map(item => (
                <button
                    key={item.id}
                    className={`bottom-nav-item ${activeSheet === item.id ? 'bottom-nav-item--active' : ''}`}
                    onClick={() => onToggle(item.id)}
                >
                    <span className="bottom-nav-icon">{item.icon}</span>
                    <span className="bottom-nav-label">{item.label}</span>
                </button>
            ))}
        </div>
    );
}
