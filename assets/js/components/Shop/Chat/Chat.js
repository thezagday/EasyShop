import React, { useState, useRef, useEffect } from 'react';

export default function Chat({ containerHeight = "620px" }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (trimmed === '') return;

        setMessages(msgs => [...msgs, { user: 'Вы', text: trimmed }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed }),
            });
            const data = await response.json();

            setMessages(msgs =>
                [...msgs, { user: 'AI', text: data.answer }]
            );
        } catch (e) {
            setMessages(msgs =>
                [...msgs, { user: 'AI', text: 'Ошибка при общении с сервером.' }]
            );
        }
        setLoading(false);
    };

    return (
        <div
            className="tm-bg-gray tm-video-details"
            style={{
                height: containerHeight,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: "8px",
                boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
                justifyContent: 'flex-start'
            }}
        >
            <h5 className="tm-text-primary mb-3">Чат с AI</h5>
            <div
                className="chat-messages mb-3"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    background: '#fff',
                    minHeight: 0
                }}
            >
                {messages.length === 0 &&
                    <div className="text-muted text-center">Нет сообщений</div>
                }
                {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-2 ${msg.user === 'AI' ? 'text-primary' : 'font-weight-bold'}`}>
                        <span><strong>{msg.user}:</strong> {msg.text}</span>
                    </div>
                ))}
                <div ref={messagesEndRef}></div>
                {loading &&
                    <div className="text-secondary">AI печатает...</div>
                }
            </div>
            <div className="input-group" style={{ alignItems: 'center', flex: '0 0 auto' }}>
                <input
                    className="form-control"
                    placeholder="Сообщение..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                    disabled={loading}
                    style={{
                        flex: 1,
                        minWidth: 0,
                        paddingTop: '0.35rem',
                        paddingBottom: '0.35rem',
                        fontSize: '1rem',
                        borderRadius: '4px 0 0 4px'
                    }}
                />
                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSend}
                    disabled={loading || input.trim() === ''}
                    style={{
                        whiteSpace: 'nowrap',
                        padding: '0.35rem 1.1rem',
                        fontSize: '1rem',
                        borderRadius: '0 4px 4px 0'
                    }}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
}