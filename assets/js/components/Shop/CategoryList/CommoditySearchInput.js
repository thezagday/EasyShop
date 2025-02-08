import React, {useEffect, useState} from 'react';
import Select from "react-select";
import {transformToOptions} from "../../Utils/transformToOptionsUtils"

export default function CommoditySearchInput({onChange}) {
    const [commodities, setCommodities] = useState([]);

    async function fetchCommodities() {
        try {
            let response = await fetch(`http://easy:8080/api/commodities`);
            let data = await response.json();

            setCommodities(data['hydra:member']);
        } catch (error) {
            console.error(error);
        }
    }
    function handleSelectChange (event) {
        if (!event) {
            return;
        }

        fetch(`http://easy:8080/api/commodities?title=${event.label}`)
            .then(response => response.json())
            .then(data => {
                onChange(data['hydra:member']);
            });
    }

    useEffect(() => {
        fetchCommodities();
    }, []);

    const options = transformToOptions(commodities);

    return (
        <div>
            <Select
                options={options}
                onChange={handleSelectChange}
                isClearable={true}
                placeholder={'Поиск по товарам'}
            />
        </div>
    );
}