import React from 'react';
import Select from "react-select";

export default function CommodityMultiSearchInput({categories, onChange}) {
    const commodities = categories.flatMap(category => category.commodities);

    function handleSelectChange (event) {
        if (!event) {
            return;
        }

        const selectedCommodities = event.map(commodity => commodity.value);

        onChange(categories.filter(category =>
            category.commodities.some(commodity => selectedCommodities.includes(commodity.id))
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
                isMulti
                options={options}
                onChange={handleSelectChange}
                isClearable={true}
                placeholder={'Маршрут'}
            />
        </div>
    );
}