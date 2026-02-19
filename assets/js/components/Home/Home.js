import React, { useState, useEffect } from 'react';
import ShopList from "./ShopList/ShopList";
import SearchInput from "./SearchInput/SearchInput";

export default function Home() {
    const [shops, setShops] = useState([]);

    useEffect(() => {
        fetchShops();
    }, []);

    async function fetchShops() {
        try {
            let response = await fetch(`/api/shops`);
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
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <SearchInput onChange={updateShopList} />
            <ShopList shops={shops}/>
        </div>
    );
}