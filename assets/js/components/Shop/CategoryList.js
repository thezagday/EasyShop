import React from "react";
import "leaflet";
import 'leaflet/dist/leaflet.css';

export default function CategoryList({ categories }) {
    const emptyMessage = 'В этом магазине пока нет категорий.';
    const categoryList = categories.map((shopCategory) =>
        <a key={shopCategory.category.id} href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">{shopCategory.category.title}</a>
    );

    return (
        categoryList.length ? (
            <div>
                <h3 className="tm-text-gray-dark mb-3">К покупке:</h3>
                {categoryList}
            </div>
        ) : (
            <div>{emptyMessage}</div>
        )
    )
}