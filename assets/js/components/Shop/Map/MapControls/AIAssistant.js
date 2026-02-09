import React, { useState, useRef, useEffect } from 'react';

export function AIAssistant({ shopId, onResult }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const chatBodyRef = useRef(null);
    const wrapperRef = useRef(null);

    // Блокируем всплытие wheel-события к Leaflet через нативный listener
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const stopWheel = (e) => {
            e.stopPropagation();
        };
        el.addEventListener('wheel', stopWheel, { passive: false });
        return () => el.removeEventListener('wheel', stopWheel);
    }, []);

    // Автоскролл вниз при новых сообщениях
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (trimmed === '') return;

        const parsedShopId = Number.parseInt(shopId, 10);
        if (!Number.isInteger(parsedShopId) || parsedShopId <= 0) {
            setMessages(prev => [...prev, {
                type: 'user', text: trimmed
            }, {
                type: 'ai', text: 'Ошибка: некорректный идентификатор магазина.', categories: []
            }]);
            return;
        }

        // Добавляем сообщение пользователя
        setMessages(prev => [...prev, { type: 'user', text: trimmed }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, shopId: parsedShopId }),
            });
            const data = await response.json();

            // Remove duplicate categories by title
            const uniqueCategories = data.categories ? 
                Array.from(new Map(data.categories.map(cat => [cat.title || cat.category?.title, cat])).values())
                : [];

            const aiMsg = {
                type: 'ai',
                text: data.answer,
                categories: uniqueCategories
            };

            setMessages(prev => [...prev, aiMsg]);

            if (uniqueCategories.length > 0 && onResult) {
                onResult({
                    question: trimmed,
                    answer: data.answer,
                    categories: uniqueCategories
                });
            }
        } catch (e) {
            setMessages(prev => [...prev, {
                type: 'ai', text: 'Ошибка при общении с сервером.', categories: []
            }]);
        }
        setLoading(false);
    };

    const handleBuildRoute = (msg) => {
        if (onResult && msg.categories && msg.categories.length > 0) {
            onResult({
                answer: msg.text,
                categories: msg.categories,
                buildRoute: true
            });
        }
    };

    return (
        <div className="ai-assistant-wrapper" ref={wrapperRef}>
            {/* Область сообщений */}
            <div className="ai-chat-body" ref={chatBodyRef}>
                {messages.length === 0 && !loading && (
                    <div className="ai-chat-empty">
                        🤖 Привет! Напишите что вы хотите найти или приготовить, и я подберу нужные товары.
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`ai-chat-message ai-chat-${msg.type}`}>
                        {msg.type === 'user' ? (
                            <div className="ai-chat-bubble ai-chat-bubble-user">
                                {msg.text}
                            </div>
                        ) : (
                            <div className="ai-chat-bubble ai-chat-bubble-ai">
                                <div className="ai-answer-text">{msg.text}</div>
                                {msg.categories && msg.categories.length > 0 && (
                                    <div className="ai-categories">
                                        <div className="ai-categories-title">📍 Найденные категории ({msg.categories.length}):</div>
                                        {msg.categories.map((cat, cIdx) => (
                                            <div key={cIdx} className="ai-category-item">
                                                <div className="ai-category-name">📂 {cat.title || cat.category?.title || 'Категория'}</div>
                                                {cat.commodities && cat.commodities.length > 0 && (
                                                    <div className="ai-commodity-list">
                                                        {cat.commodities.map((commodity, pIdx) => (
                                                            <span key={pIdx} className="ai-commodity-tag">
                                                                {commodity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button 
                                            className="ai-build-route-button"
                                            onClick={() => handleBuildRoute(msg)}
                                        >
                                            🗺️ Построить маршрут
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="ai-chat-message ai-chat-ai">
                        <div className="ai-chat-bubble ai-chat-bubble-ai">
                            <div className="ai-loading">
                                <div className="spinner-small"></div>
                                <span>AI думает...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Поле ввода всегда внизу */}
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
        </div>
    );
}
