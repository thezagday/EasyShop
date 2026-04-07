import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DISMISS_COOKIE_NAME = 'pwa_install_prompt_dismissed';
const DISMISS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function hasDismissCookie() {
    return document.cookie
        .split(';')
        .map((item) => item.trim())
        .some((item) => item.startsWith(`${DISMISS_COOKIE_NAME}=1`));
}

function setDismissCookie() {
    document.cookie = `${DISMISS_COOKIE_NAME}=1; Max-Age=${DISMISS_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

export default function PWAInstallPrompt() {
    const { t } = useTranslation();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Listen for beforeinstallprompt event
        const handler = (e) => {
            if (hasDismissCookie()) {
                return;
            }

            // Prevent standard display
            e.preventDefault();
            // Save event for later use
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show standard install dialog
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        // Hide our prompt
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
        setDismissCookie();
    };

    useEffect(() => {
        if (hasDismissCookie()) {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#667eea',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '90%',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {t('pwa.title')}
                </strong>
                <small style={{ opacity: 0.9 }}>
                    {t('pwa.description')}
                </small>
            </div>
            <button
                onClick={handleInstallClick}
                style={{
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                }}
            >
                {t('pwa.install')}
            </button>
            <button
                onClick={handleDismiss}
                style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: '1px solid white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                ✕
            </button>
            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateX(-50%) translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
