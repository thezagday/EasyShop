import React, { useState, useEffect } from 'react';
import ShopList from "./Shop/ShopList";
import SearchInput from "./Search/SearchInput";

export default function Home() {
    const [shops, setShops] = useState([]);

    useEffect(() => {
        fetchShops();
    }, []);

    async function fetchShops () {
        await fetch('http://easy:8080/api/shops')
            .then(response => response.json())
            .then(data => {
                setShops(data['hydra:member']);
            });
    }

    function updateShopList (shops) {
        setShops(shops);
    }

    return (
        <div>
            <SearchInput onTextChange={updateShopList} />
            <ShopList shops={shops}/>
        </div>
    );
}