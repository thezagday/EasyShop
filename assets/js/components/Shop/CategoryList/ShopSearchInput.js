import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Select from 'react-select'

export default function ShopSearchCategoryInput({onChange}) {
    let { id } = useParams();
    const [categories, setCategories] = useState([]);

    async function fetchCategories() {
        try {
            let response = await fetch(`http://easy:8080/api/categories?retailer=1`); // TODO Retailer
            let data = await response.json();

            setCategories(data['hydra:member']);
        } catch (error) {
            console.error(error);
        }
    }

    function handleSelectChange (event) {
        if (!event) {
            return;
        }

        fetch(`http://easy:8080/api/shop_categories?shop=${id}&category.title=${event.label}`)
            .then(response => response.json())
            .then(data => {
                onChange(data['hydra:member']);
            });
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const transformToOptions = (categories) => {
        return categories.map(category => ({
            value: category.id.toString(),
            label: category.title
        }));
    };

    const options = transformToOptions(categories);

    return (
        <div>
            <Select
                options={options}
                onChange={handleSelectChange}
                isClearable={true}
                placeholder={'Поиск по категориям'}
            />
        </div>
    );
}