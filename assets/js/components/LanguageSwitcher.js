import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'pl', name: 'PL', flag: '\uD83C\uDDF5\uD83C\uDDF1' },
    { code: 'en', name: 'EN', flag: '🇺🇸' }
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        const localeCookie = `_locale=${encodeURIComponent(lng)};path=/;max-age=31536000;SameSite=Lax`;
        document.cookie = localeCookie;
        window.location.reload();
    };

    return (
        <div className="language-switcher d-flex align-items-center ml-3">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    className={`btn btn-sm ${i18n.language === lang.code ? 'btn-primary' : 'btn-outline-secondary'} mx-1`}
                    onClick={() => changeLanguage(lang.code)}
                    title={lang.name}
                    style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.name}
                </button>
            ))}
        </div>
    );
}
