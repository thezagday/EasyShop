export const transformToOptions = (entities) => {
    return entities.map(entity => ({
        value: entity.id.toString(),
        label: entity.title
    }));
};