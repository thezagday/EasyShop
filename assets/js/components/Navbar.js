import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const { username, isAdmin, isAdminHost, adminUrl, isLoggedIn } = useAppContext();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!userMenuRef.current) return;
            if (!userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const closeAllMenus = () => {
        setMenuOpen(false);
        setUserMenuOpen(false);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg" style={{ position: 'relative', zIndex: 1100 }}>
                <div className="container-fluid">
                    <a className="navbar-brand" href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/img/logo.svg" alt="EasyShop" style={{ height: '36px' }} />
                    </a>
                    {username && (
                        <span className="navbar-text ml-3 d-none d-sm-inline-block" style={{ color: '#666' }}>
                            Привет, {username}
                        </span>
                    )}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-controls="navbarSupportedContent"
                        aria-expanded={menuOpen}
                        aria-label="Toggle navigation"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className={`navbar-collapse collapse ${menuOpen ? 'show' : ''}`} id="navbarSupportedContent">
                        <ul className="navbar-nav ml-auto mb-2 mb-lg-0">
                            {isAdminHost ? (
                                // На admin хосте показываем только "Управление" и вход без регистрации
                                <>
                                    {isAdmin ? (
                                        <li className="nav-item">
                                            <a className="nav-link nav-link-1" href="/admin" onClick={() => setMenuOpen(false)}>Управление</a>
                                        </li>
                                    ) : (
                                        <li className="nav-item">
                                            <a className="nav-link nav-link-1" href="/login" onClick={() => setMenuOpen(false)}>Вход</a>
                                        </li>
                                    )}
                                    {isLoggedIn && (
                                        <li className="nav-item">
                                            <a className="nav-link nav-link-1" href="/logout" onClick={() => setMenuOpen(false)}>Выход</a>
                                        </li>
                                    )}
                                </>
                            ) : (
                                // На основном хосте показываем полное меню БЕЗ "Управление"
                                <>
                                    <li className="nav-item">
                                        <NavLink
                                            className={({ isActive }) => (isActive ? "nav-link nav-link-1 active" : 'nav-link nav-link-1')}
                                            end to={"/"} aria-current="page"
                                            onClick={closeAllMenus}>Магазины</NavLink>
                                    </li>
                                    {username ? (
                                        <>
                                            <li className="nav-item nav-user-menu" ref={userMenuRef}>
                                                <button
                                                    type="button"
                                                    className="nav-link nav-link-1 nav-user-menu-btn"
                                                    onClick={() => setUserMenuOpen(prev => !prev)}
                                                    aria-haspopup="true"
                                                    aria-expanded={userMenuOpen}
                                                >
                                                    <i className="fas fa-user-circle"></i>
                                                    <span>Аккаунт</span>
                                                </button>
                                                <div className={`nav-user-menu-dropdown ${userMenuOpen ? 'show' : ''}`}>
                                                    <NavLink
                                                        className={({ isActive }) => (isActive ? 'nav-user-menu-item active' : 'nav-user-menu-item')}
                                                        to={"/profile"}
                                                        onClick={closeAllMenus}
                                                    >
                                                        Личный кабинет
                                                    </NavLink>
                                                    <a className="nav-user-menu-item" href="/logout" onClick={closeAllMenus}>Выход</a>
                                                </div>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="nav-item">
                                                <a className="nav-link nav-link-1" href="/login" onClick={closeAllMenus}>Вход</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link nav-link-1" href="/register" onClick={closeAllMenus}>Регистрация</a>
                                            </li>
                                        </>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}