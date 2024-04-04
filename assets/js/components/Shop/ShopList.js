import React from "react";
import ShopListItem from "./ShopListItem";

export default function ShopList({shops}) {
    const emptyMessage = 'К сожалению, такой магазин мы еще не добавили.';
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