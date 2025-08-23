import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NotFound() {
    const location = useLocation();

    return (
        <main className="container mt-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="card shadow p-4" style={{ maxWidth: 420, width: '100%' }}>
                <div className="text-center">
                    <div className="mb-3" style={{ fontSize: '4rem', color: '#2d68ff' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 className="display-4" style={{ fontWeight: 700, fontSize: '2.2rem' }}>Ошибка 404</h1>
                    <p className="text-muted mt-2 mb-3">
                        Страница <span style={{wordBreak:'break-all'}}>{location.pathname}</span> не найдена.
                    </p>
                    <Link to="/" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i> На главную
                    </Link>
                </div>
            </div>
        </main>
    );
}