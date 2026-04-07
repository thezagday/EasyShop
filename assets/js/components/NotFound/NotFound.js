import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
    const { t } = useTranslation();
    const location = useLocation();

    return (
        <main className="container mt-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="card shadow p-4" style={{ maxWidth: 420, width: '100%' }}>
                <div className="text-center">
                    <div className="mb-3" style={{ fontSize: '4rem', color: '#2d68ff' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h1 className="display-4" style={{ fontWeight: 700, fontSize: '2.2rem' }}>{t('not_found.title')}</h1>
                    <p className="text-muted mt-2 mb-3">
                        {t('not_found.description', { path: location.pathname })}
                    </p>
                    <Link to="/" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i> {t('not_found.back_to_home')}
                    </Link>
                </div>
            </div>
        </main>
    );
}