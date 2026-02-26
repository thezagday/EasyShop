import React, { createContext, useContext } from 'react';

const AppContext = createContext({});

export function AppProvider({ children }) {
    const rootElement = document.getElementById('root');

    const username = rootElement ? rootElement.getAttribute('data-user') : '';
    const userId = rootElement ? rootElement.getAttribute('data-user-id') : '';
    const adminUrl = rootElement ? rootElement.getAttribute('data-admin-url') : '/admin';
    const mainUrl = rootElement ? rootElement.getAttribute('data-main-url') : '/';

    let roles = [];
    try {
        const rolesData = rootElement ? rootElement.getAttribute('data-roles') : '[]';
        roles = JSON.parse(rolesData);
    } catch (e) {
        console.error('Error parsing roles', e);
    }

    const isAdmin = roles.includes('ROLE_ADMIN');
    const isAdminHost = window.location.hostname.includes('admin.');
    const isLoggedIn = !!username;

    const value = {
        username,
        userId,
        roles,
        isAdmin,
        isAdminHost,
        isLoggedIn,
        adminUrl,
        mainUrl,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
