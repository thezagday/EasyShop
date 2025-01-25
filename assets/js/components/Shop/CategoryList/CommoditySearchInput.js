import React from 'react';
import {useParams} from "react-router-dom";

export default function CommoditySearchInput({onChange}) {
    let { id } = useParams();
    function handleChange (event) {
        fetch(`http://easy:8080/api/commodities?title=${event.target.value}`)
            .then(response => response.json())
            .then(data => {
                onChange(data['hydra:member']);
            });
    }

    return (
        <div className="tm-hero d-flex justify-content-center align-items-center">
            <form className="d-flex tm-search-form">
                <input className="form-control tm-search-input"
                       type="text"
                       onChange={handleChange}
                       placeholder="Поиск по товарам"
                       aria-label="Search"
                />
            </form>
        </div>
    );
}