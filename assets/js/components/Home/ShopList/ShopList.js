import React from "react";
import { useTranslation } from 'react-i18next';
import ShopListItem from "./ShopListItem/ShopListItem";

export default function ShopList({shops}) {
    const { t } = useTranslation();
    const emptyMessage = t('home.empty_shops');
    const shopItems = shops.map((shop) =>
        <ShopListItem key={shop.id} id={shop.id} title={shop.title} avatar={shop.avatar}/>
    );

    return (
        shopItems.length ? (
            <div className="container-fluid tm-container-content tm-mt-60">
                <div className="row tm-mb-90 tm-gallery">
                    {shopItems}
                </div>
            </div>
        ) : (
            <div className="centered-div">
                {emptyMessage}
            </div>
        )
    );
}