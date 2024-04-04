import React, { useState, useEffect } from 'react';
import ShopList from "./Shop/ShopList";
import SearchInput from "./Search/SearchInput";

export default function Home() {
    const [shops, setShops] = useState([]);
    const [totalShops, setTotalShops] = useState(0);
    const [text, setText] = useState('');

    useEffect(() => {
        fetchShops();
    }, []);

    async function fetchShops () {
        await fetch('http://easy:8080/api/shops')
            .then(response => response.json())
            .then(data => {
                setShops(data['hydra:member']);
                setTotalShops(data['hydra:totalItems']);
            });
    }

    function updateList (shops, text) {
        setShops(shops);
        setText(text);
    }

    function searching () {
        setShops([]);
        setTotalShops(0);
    }

    return (
        <div>
            <SearchInput onTextChange={updateList} onEmptyInput={fetchShops} onSearching={searching} />
            <ShopList shops={shops}/>
        </div>
    );
}