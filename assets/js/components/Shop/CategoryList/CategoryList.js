import React from "react";
import "leaflet";
import 'leaflet/dist/leaflet.css';
import ShopSearchInput from "./ShopSearchInput";
import CommoditySearchInput from "./CommoditySearchInput";

export default function CategoryList({
    categories,
    onSourceCategoryChange,
    onDestinationCategoryChange,
    onSearchCategories,
    onSearchCommodities,
}) {
    const emptyMessage = 'В этом магазине пока нет категорий.';
    const categoryList = categories.map((shopCategory) =>
        <a key={shopCategory.category.id} href="#" className="tm-text-primary mr-4 mb-2 d-inline-block">{shopCategory.category.title}</a>
    );

    function handleSourceChange(event) {
        const source = event.target.value;
        onSourceCategoryChange(source);
    }

    function handleDestinationChange(event) {
        const destination = event.target.value;
        onDestinationCategoryChange(destination);
    }

    function handleSearchedCategories(searchedCategories) {
        onSearchCategories(searchedCategories);
    }

    function handleSearchedCommodities(searchedCommodities) {
        onSearchCommodities(searchedCommodities);
    }

    return (
        categoryList.length ? (
            <div>
                <ShopSearchInput onChange={handleSearchedCategories} />
                <CommoditySearchInput onChange={handleSearchedCommodities} />
                <h3 className="tm-text-gray-dark mb-3">Категории:</h3>
                <select onChange={handleSourceChange} className="form-control" id="contact-select" name="inquiry">
                    {categories.map(shopCategory => (
                        <option key={shopCategory.category.id}
                                value={shopCategory.category.title}>{shopCategory.category.title}</option>
                    ))}
                </select>
                <br/>
                <select onChange={handleDestinationChange} className="form-control" id="contact-select" name="inquiry">
                    {categories.map(shopCategory => (
                        <option key={shopCategory.category.id}
                                value={shopCategory.category.title}>{shopCategory.category.title}</option>
                    ))}
                </select>
            </div>
        ) : (
            <div>{emptyMessage}</div>
        )
    )
}