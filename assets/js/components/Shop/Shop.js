import React, {useEffect, useRef, useState} from 'react';
import {useParams} from "react-router-dom";
import Map from "./Map"
import CategoryList from "./CategoryList"

export default function Shop() {
    // To avoid repetitive "prop drilling", see https://react.dev/learn/scaling-up-with-reducer-and-context
    const [shop, setShop] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isBuildRouteClicked, setBuildRouteClicked] = useState(false);

    let { id } = useParams();

    let sourceRef = useRef('Бакалея');
    let destinationRef = useRef('Бакалея');

    useEffect(() => {
        fetchShop();
        fetchCategories();
    }, []);

    async function fetchShop() {
        try {
            let response = await fetch(`http://easy:8080/api/shops/${id}`);
            let data = await response.json();

            setShop(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchCategories() {
        try {
            let response = await fetch(`http://easy:8080/api/shop_categories?shop=${id}`);
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

    let buildRouteButton = '';
    if (categories.length) {
        buildRouteButton = <a className="btn btn-primary tm-btn-big" onClick={handleOnClick}>Построить маршрут</a>
    }

    return (
        <div>
            <div className="container-fluid tm-container-content tm-mt-60">
                <div className="row mb-4">
                    <h2 className="col-12 tm-text-primary">{shop.title}</h2>
                </div>
                <div className="row tm-mb-90">
                    <div className="col-xl-9 col-lg-8 col-md-7 col-sm-12">
                        <Map
                            isBuildRouteClicked={isBuildRouteClicked}
                            categories={categories}
                            source={sourceRef.current}
                            destination={destinationRef.current}
                            postBuildRoute={postBuildRoute}
                        />
                    </div>
                    <div className="col-xl-3 col-lg-4 col-md-5 col-sm-12">
                        <div className="tm-bg-gray tm-video-details">
                            <CategoryList
                                categories={categories}
                                onSourceCategoryChange={handleSourceCategoryChange}
                                onDestinationCategoryChange={handleDestinationCategoryChange}
                            />
                            <div className="text-center mb-5 mt-5">
                                {buildRouteButton}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}