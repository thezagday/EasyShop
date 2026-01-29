import React, { useState } from 'react';

export function AIAssistant({ shopId, onResult }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (trimmed === '') return;

        setLoading(true);
        setLastResult(null);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, shopId: shopId }),
            });
            const data = await response.json();

            // Remove duplicate categories by title
            const uniqueCategories = data.categories ? 
                Array.from(new Map(data.categories.map(cat => [cat.title || cat.category?.title, cat])).values())
                : [];

            setLastResult({
                question: trimmed,
                answer: data.answer,
                categories: uniqueCategories
            });

            if (uniqueCategories.length > 0 && onResult) {
                onResult({
                    question: trimmed,
                    answer: data.answer,
                    categories: uniqueCategories
                });
            }

            setInput('');
        } catch (e) {
            setLastResult({
                question: trimmed,
                answer: 'Ошибка при общении с сервером.',
                categories: []
            });
        }
        setLoading(false);
    };

    return (
        <div className="ai-assistant-wrapper">
            <div className="ai-input-group">
                <input
                    className="map-search-input"
                    placeholder="Например: хочу сделать плов..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !loading) handleSend(); }}
                    disabled={loading}
                />
                <button
                    className="ai-send-button"
                    onClick={handleSend}
                    disabled={loading || input.trim() === ''}
                >
                    {loading ? '⏳' : '🚀'}
                </button>
            </div>

            {loading && (
                <div className="ai-response-box">
                    <div className="ai-loading">
                        <div className="spinner-small"></div>
                        <span>AI думает...</span>
                    </div>
                </div>
            )}

            {lastResult && !loading && (
                <div className="ai-response-box">
                    <div className="ai-question">
                        <strong>Вы:</strong> {lastResult.question}
                    </div>
                    <div className="ai-answer">
                        <strong>AI:</strong> {lastResult.answer}
                    </div>
                    {lastResult.categories.length > 0 && (
                        <div className="ai-categories">
                            <div className="ai-categories-title">📍 Найденные категории ({lastResult.categories.length}):</div>
                            {lastResult.categories.map((cat, idx) => (
                                <div key={idx} className="ai-category-item">
                                    • {cat.title || cat.category?.title || 'Категория'}
                                </div>
                            ))}
                            <button 
                                className="ai-build-route-button"
                                onClick={() => onResult && onResult({ ...lastResult, buildRoute: true })}
                            >
                                🗺️ Построить маршрут через все
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
