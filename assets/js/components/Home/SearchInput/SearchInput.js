import React, { useRef, useCallback } from 'react';

export default function SearchInput({ onChange }) {
    const timerRef = useRef(null);
    const abortRef = useRef(null);

    const handleChange = useCallback((event) => {
        const value = event.target.value.trim();

        // Отменяем предыдущий таймер
        if (timerRef.current) clearTimeout(timerRef.current);

        // Отменяем предыдущий запрос
        if (abortRef.current) abortRef.current.abort();

        // Если пустая строка — загружаем все магазины без задержки
        if (value === '') {
            abortRef.current = new AbortController();
            fetch('/api/shops', { signal: abortRef.current.signal })
                .then(r => r.json())
                .then(data => onChange(data['hydra:member']))
                .catch(() => {});
            return;
        }

        // Минимум 2 символа для поиска
        if (value.length < 2) return;

        // Debounce 400ms
        timerRef.current = setTimeout(() => {
            abortRef.current = new AbortController();
            fetch(`/api/shops?title=${encodeURIComponent(value)}`, {
                signal: abortRef.current.signal
            })
                .then(r => r.json())
                .then(data => onChange(data['hydra:member']))
                .catch(() => {});
        }, 400);
    }, [onChange]);

    return (
        <div className="tm-hero d-flex flex-column justify-content-center align-items-center">
            <form className="d-flex tm-search-form" onSubmit={e => e.preventDefault()}>
                <input className="form-control tm-search-input"
                    type="text"
                    onChange={handleChange}
                    placeholder="Поиск"
                    aria-label="Search"
                />
            </form>
        </div>
    );
}