import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Map from "./Map"
import CategoryList from "./CategoryList"

export default function Shop() {
    const [shop, setShop] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isBuildRouteClicked, setBuildRouteClicked] = useState(false);

    let { id } = useParams();

    useEffect(() => {
        fetchShop();
        fetchCategories();
    }, []);

    async function fetchShop() {
        await fetch(`http://easy:8080/api/shops/${id}`)
            .then(response => response.json())
            .then(data => {
                setShop(data)
            });
    }

    async function fetchCategories() {
        await fetch(`http://easy:8080/api/shop_categories?shop=${id}`)
            .then(response => response.json())
            .then(data => {
                setCategories(data['hydra:member'])
            });
    }

    function handleOnClick() {
        setBuildRouteClicked(true);
    }

    let buildRouteButton = '';
    if (categories.length) {
        buildRouteButton = <a className="btn btn-primary tm-btn-big" onClick={handleOnClick}>Построить маршрут</a>
    }

    return (
        <div>
            <div className="tm-hero d-flex justify-content-center align-items-center" data-parallax="scroll" data-image-src="img/hero.jpg"></div>
            <div className="container-fluid tm-container-content tm-mt-60">
                <div className="row mb-4">
                    <h2 className="col-12 tm-text-primary">{shop.title}</h2>
                </div>
                <div className="row tm-mb-90">
                    <Map isBuildRouteClicked={isBuildRouteClicked} categories={categories} />
                    <div className="col-xl-4 col-lg-5 col-md-6 col-sm-12">
                        <div className="tm-bg-gray tm-video-details">
                            <CategoryList categories={categories} />
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