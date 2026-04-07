import React from "react";
import {NavLink} from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../../../context/AppContext';

export default function ShopListItem({avatar, id, title}) {
    const { t } = useTranslation();
    const { isAdmin, isAdminHost, adminUrl } = useAppContext();

    return (
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-5">
            <figure className="effect-ming tm-video-item shop-card-figure">
                <img src={`/img/${avatar}`} alt={title} className="shop-card-img"/>
                <figcaption className="d-flex align-items-center justify-content-center">
                    <h2>{t('home.open')}</h2>
                    <NavLink to={`/shop/${id}`}>{t('home.open')}</NavLink>
                </figcaption>
            </figure>
            <div className="d-flex justify-content-between align-items-center shop-card-footer">
                <span className="shop-card-title">{title}</span>
                {isAdmin && isAdminHost && (
                    <a href={`${adminUrl}/map-editor/${id}`}
                       className="tm-text-primary shop-card-edit"
                       title={t('home.edit_map')}>
                        <i className="fas fa-pen"></i>
                    </a>
                )}
            </div>
        </div>
    );
}