import React from 'react';
import Select from 'react-select'
import { useTranslation } from 'react-i18next';

export default function CategorySearchInput({categories, onChange}) {
    const { t } = useTranslation();
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
                placeholder={t('shop.placeholders.search_categories')}
            />
        </div>
    );
}