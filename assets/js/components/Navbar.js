import React from 'react';
import {NavLink} from 'react-router-dom';

export default function Navbar() {
    const rootElement = document.getElementById('root');
    const username = rootElement ? rootElement.getAttribute('data-user') : '';
    const rolesData = rootElement ? rootElement.getAttribute('data-roles') : '[]';
    
    let roles = [];
    try {
        roles = JSON.parse(rolesData);
    } catch (e) {
        console.error("Error parsing roles", e);
    }
    
    const isAdmin = roles.includes('ROLE_ADMIN');
    const adminUrl = rootElement ? rootElement.getAttribute('data-admin-url') : '/admin';

    return (
        <>
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <i className="fas fa-film mr-2"></i>
                        EasyShop
                    </a>
                    {username && (
                        <span className="navbar-text ml-3 d-none d-sm-inline-block" style={{color: '#666'}}>
                            Привет, {username}
                        </span>
                    )}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ml-auto mb-2 mb-lg-0">
                            {isAdmin && (
                                <li className="nav-item">
                                    <a className="nav-link nav-link-1" href={adminUrl}>Админка</a>
                                </li>
                            )}
                            <li className="nav-item">
                                <NavLink
                                    className={({isActive}) => (isActive ? "nav-link nav-link-1 active" : 'nav-link nav-link-1')}
                                    end to={"/"} aria-current="page">Магазины</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className={({isActive}) => (isActive ? "nav-link nav-link-1 active" : 'nav-link nav-link-1')}
                                    to={"/contact"} aria-current="page">Контакты</NavLink>
                            </li>
                            <li className="nav-item">
                                <a aria-current="page" className="nav-link nav-link-1" href="/leaflet">Leaflet</a>
                            </li>
                            <li className="nav-item">
                                <a aria-current="page" className="nav-link nav-link-1" href="/seadragon">Seadragon</a>
                            </li>
                            <li className="nav-item">
                                <a aria-current="page" className="nav-link nav-link-1" href="/ai">AI</a>
                            </li>
                            {username && (
                                <li className="nav-item">
                                    <a className="nav-link nav-link-1" href="/logout">Выход</a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}