import React from "react";
import {NavLink} from "react-router-dom";

export default function ShopListItem({avatar, id, title}) {
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
            </div>
        </div>
    );
}