import React from 'react';
import Select from 'react-select'

export default function CategorySearchInput({categories, onChange}) {
    function handleSelectChange (event) {
        if (!event) {
            return;
        }

        onChange(categories.find(category => category.id === event.value));
    }

    const transformToOptions = (entities) => {
        return entities.map(entity => ({
            value: entity.id,
            label: entity.category.title
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