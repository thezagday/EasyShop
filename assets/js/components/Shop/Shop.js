import React, {useEffect, useRef, useState} from 'react';
import {useParams} from "react-router-dom";
import Map from "./Map/Map";

const SIDEBLOCK_HEIGHT = 620;

export default function Shop() {
    // To avoid repetitive "prop drilling", see https://react.dev/learn/scaling-up-with-reducer-and-context
    const [shop, setShop] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isBuildRouteClicked, setBuildRouteClicked] = useState(false);
    const [searchedCategory, setSearchedCategory] = useState([]);
    const [searchedCategoryByCommodity, setSearchedCategoryByCommodity] = useState([]);
    const [multiSearch, setMultiSearch] = useState([]);

    let { id } = useParams();

    let sourceRef = useRef(null);
    let destinationRef = useRef(null);

    useEffect(() => {
        fetchShop();
        fetchCategories();
    }, []);

    async function fetchShop() {
        try {
            let response = await fetch(`/api/shops/${id}`);
            let data = await response.json();

            setShop(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchCategories() {
        try {
            let response = await fetch(`/api/shop_categories?shop=${id}`);
            let data = await response.json();

            setCategories(data['hydra:member']);
        } catch (error) {
            console.error(error);
        }
    }

    function handleOnClick() {
        setBuildRouteClicked(true);
    }

    function postBuildRoute() {
        setBuildRouteClicked(false);
    }

    function handleSourceCategoryChange(source) {
        sourceRef.current = source;
    }

    function handleDestinationCategoryChange(destination) {
        destinationRef.current = destination;
    }

    function handleSearchedCategory(searchedCategory) {
        setSearchedCategory(searchedCategory);
    }

    function handleSearchedCategoryByCommodity(searchedCategoryByCommodity) {
        setSearchedCategoryByCommodity(searchedCategoryByCommodity);
    }

    function handleMultiSearch(commodities) {
        setMultiSearch(commodities);
    }

    function handleAICategories(categories) {
        setSearchedCategoryByCommodity(categories);
    }

    let buildRouteButton = '';
    if (categories.length) {
        buildRouteButton = <a className="btn btn-primary tm-btn-big" onClick={handleOnClick}>Построить маршрут</a>
    }

    return (
        <div className="container-fluid tm-container-content tm-mt-60">
            <div className="row mb-4">
                <h2 className="col-12 tm-text-primary">{shop.title}</h2>
            </div>
            <div className="row tm-mb-90">
                <div className="col-12">
                    <Map
                        shopId={id}
                        isBuildRouteClicked={isBuildRouteClicked}
                        categories={categories}
                        source={sourceRef.current}
                        destination={destinationRef.current}
                        postBuildRoute={postBuildRoute}
                        searchedCategory={searchedCategory}
                        searchedCategoryByCommodity={searchedCategoryByCommodity}
                        multiSearch={multiSearch}
                        height={SIDEBLOCK_HEIGHT}
                    />
                </div>
            </div>
        </div>
    );
}