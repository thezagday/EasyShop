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
            <figure className="effect-ming tm-video-item">
                <img src={`/img/${avatar}`} alt="Image" className="img-fluid"/>
                <figcaption className="d-flex align-items-center justify-content-center">
                    <h2>Войти</h2>
                    <NavLink to={`/shop/${id}`}>Войти</NavLink>
                </figcaption>
            </figure>
            <div className="d-flex justify-content-between tm-text-gray">
                <span>{title}</span>
                {isAdmin && (
                    <a href={`${adminUrl}?crudAction=edit&crudControllerFqcn=App%5CController%5CAdmin%5CShopCrudController&entityId=${id}`} 
                       className="tm-text-primary" 
                       title="Редактировать">
                        <i className="fas fa-pen"></i>
                    </a>
                )}
            </div>
        </div>
    );
}