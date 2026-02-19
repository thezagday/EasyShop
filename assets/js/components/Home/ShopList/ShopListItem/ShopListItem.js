import React from "react";
import {NavLink} from "react-router-dom";

export default function ShopListItem({avatar, id, title}) {
    const rootElement = document.getElementById('root');
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
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-5">
            <figure className="effect-ming tm-video-item shop-card-figure">
                <img src={`/img/${avatar}`} alt={title} className="shop-card-img"/>
                <figcaption className="d-flex align-items-center justify-content-center">
                    <h2>Открыть</h2>
                    <NavLink to={`/shop/${id}`}>Открыть</NavLink>
                </figcaption>
            </figure>
            <div className="d-flex justify-content-between align-items-center shop-card-footer">
                <span className="shop-card-title">{title}</span>
                {isAdmin && (
                    <a href={`${adminUrl}/map-editor/${id}`}
                       className="tm-text-primary shop-card-edit"
                       title="Редактировать карту">
                        <i className="fas fa-pen"></i>
                    </a>
                )}
            </div>
        </div>
    );
}