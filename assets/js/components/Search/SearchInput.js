import React from 'react';

export default function SearchInput({onTextChange}) {
    function handleChange (event) {
        fetch(`http://easy:8080/api/shops?title=${event.target.value}`)
            .then(response => response.json())
            .then(data => {
                onTextChange(data['hydra:member']);
            });
    }

    return (
        <div className="tm-hero d-flex justify-content-center align-items-center" data-parallax="scroll" data-image-src="img/hero.jpg">
            <form className="d-flex tm-search-form">
                <input className="form-control tm-search-input"
                       type="text"
                       onChange={handleChange}
                       placeholder="Поиск"
                       aria-label="Search"
                />
                <button className="btn btn-outline-success tm-search-btn" type="submit">
                    <i className="fas fa-search"/>
                </button>
            </form>
        </div>
    );
}