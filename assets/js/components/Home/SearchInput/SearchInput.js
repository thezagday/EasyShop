import React from 'react';

export default function SearchInput({onChange}) {
    function handleChange (event) {
        fetch(`/api/shops?title=${event.target.value}`)
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
                       placeholder="Поиск"
                       aria-label="Search"
                />
            </form>
        </div>
    );
}