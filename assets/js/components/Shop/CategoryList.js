import React from "react";
import "leaflet";
import 'leaflet/dist/leaflet.css';

function CategoryList({ categories }) {

    console.log(categories);
    const emptyMessage = 'В этом магазине пока нет категорий.';
    const categoriesArray = categories.map((category) =>
        <a href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">{category.category}</a>
    );

    return (
        categories.length ? (
            <div>
                <h3 className="tm-text-gray-dark mb-3">К покупке:</h3>
                {categoriesArray}
            </div>
        ) : (
            <div>
                {emptyMessage}
            </div>
        )
    )
}

export default CategoryList;