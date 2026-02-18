import React from 'react';

/**
 * Bottom navigation bar with 3 icons: AI Chat, Search, Collections
 */
export function BottomNavBar({ activeSheet, onToggle }) {
    const items = [
        { id: 'ai', icon: '🤖', label: 'AI' },
        { id: 'search', icon: '🔍', label: 'Поиск' },
        { id: 'collection', icon: '🎁', label: 'Подборки' },
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
