import React, { useState, useEffect } from 'react';
import ShopList from "./Shop/ShopList";
import SearchInput from "./Search/SearchInput";

export default function Home() {
    const [shops, setShops] = useState([]);

    useEffect(() => {
        fetchShops();
    }, []);

    async function fetchShops() {
        try {
            let response = await fetch(`http://easy:8080/api/shops`);
            let data = await response.json();

            setShops(data['hydra:member']);
        } catch (error) {
            console.error(error);
        }
    }

    function updateShopList(shops) {
        setShops(shops);
    }

    return (
        <div>
            <SearchInput onChange={updateShopList} />
            <ShopList shops={shops}/>
        </div>
    );
}