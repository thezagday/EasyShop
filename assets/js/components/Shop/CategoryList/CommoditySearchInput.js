import React from 'react';
import Select from "react-select";

export default function CommoditySearchInput({categories, onChange}) {
    const commodities = categories.flatMap(category => category.commodities);

    function handleSelectChange (event) {
        if (!event) {
            return;
        }

        onChange(categories.find(category =>
            category.commodities.some(commodity => commodity.id === event.value)
        ));
    }

    const transformToOptions = (entities) => {
        return entities.map(entity => ({
            value: entity.id,
            label: entity.title
        }));
    };

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