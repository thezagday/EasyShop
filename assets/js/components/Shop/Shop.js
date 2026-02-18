import React, {useEffect, useRef, useState} from 'react';
import {useParams} from "react-router-dom";
import Map from "./Map/Map";

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

    // Hide Twig footer, lock body scroll, make #root fill viewport for map page
    useEffect(() => {
        const footer = document.querySelector('footer.tm-footer');
        if (footer) footer.style.display = 'none';

        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100vh';

        const root = document.getElementById('root');
        if (root) {
            root.style.display = 'flex';
            root.style.flexDirection = 'column';
            root.style.height = '100vh';
        }

        return () => {
            if (footer) footer.style.display = '';
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
            if (root) {
                root.style.display = '';
                root.style.flexDirection = '';
                root.style.height = '';
            }
        };
    }, []);

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
        <div className="map-page">
            <Map
                shopId={id}
                shop={shop}
                isBuildRouteClicked={isBuildRouteClicked}
                categories={categories}
                source={sourceRef.current}
                destination={destinationRef.current}
                postBuildRoute={postBuildRoute}
                searchedCategory={searchedCategory}
                searchedCategoryByCommodity={searchedCategoryByCommodity}
                multiSearch={multiSearch}
            />
        </div>
    );
}