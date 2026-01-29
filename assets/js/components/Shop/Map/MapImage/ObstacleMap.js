// Определение препятствий (стеллажи, стены) и проходимых зон для магазина
// Координаты в пикселях относительно карты

export const OBSTACLE_MAP = {
    // Размеры карты
    mapWidth: 1653,
    mapHeight: 993,
    
    // Размер сетки для pathfinding (чем меньше - тем точнее, но медленнее)
    gridCellSize: 10, // 10 пикселей = 1 клетка сетки
    
    // Препятствия (стеллажи, стены) - области которые нельзя пересекать
    obstacles: [
        // Пример: стеллаж в центре магазина
        { x: 400, y: 200, width: 200, height: 100 },
        { x: 700, y: 300, width: 150, height: 120 },
        { x: 200, y: 500, width: 300, height: 80 },
        { x: 900, y: 400, width: 180, height: 150 },
        
        // Стены по периметру (опционально)
        // { x: 0, y: 0, width: 10, height: 993 }, // Левая стена
        // { x: 1643, y: 0, width: 10, height: 993 }, // Правая стена
        // { x: 0, y: 0, width: 1653, height: 10 }, // Верхняя стена
        // { x: 0, y: 983, width: 1653, height: 10 }, // Нижняя стена
    ],
    
    // Проходимые зоны (коридоры между стеллажами)
    // Если не указаны - вся карта проходима кроме obstacles
    walkableAreas: null // null = вся карта проходима (кроме obstacles)
};

// Функция для генерации сетки с учетом препятствий
export function generateWalkableGrid() {
    const gridWidth = Math.ceil(OBSTACLE_MAP.mapWidth / OBSTACLE_MAP.gridCellSize);
    const gridHeight = Math.ceil(OBSTACLE_MAP.mapHeight / OBSTACLE_MAP.gridCellSize);
    
    // Создаем полностью проходимую сетку
    const walkableAreas = [];
    
    if (OBSTACLE_MAP.walkableAreas === null) {
        // Вся карта проходима по умолчанию
        walkableAreas.push({
            x: 0,
            y: 0,
            width: gridWidth,
            height: gridHeight
        });
    } else {
        // Используем заданные проходимые области
        OBSTACLE_MAP.walkableAreas.forEach(area => {
            walkableAreas.push({
                x: Math.floor(area.x / OBSTACLE_MAP.gridCellSize),
                y: Math.floor(area.y / OBSTACLE_MAP.gridCellSize),
                width: Math.ceil(area.width / OBSTACLE_MAP.gridCellSize),
                height: Math.ceil(area.height / OBSTACLE_MAP.gridCellSize)
            });
        });
    }
    
    return {
        gridWidth,
        gridHeight,
        walkableAreas,
        obstacles: OBSTACLE_MAP.obstacles.map(obs => ({
            x: Math.floor(obs.x / OBSTACLE_MAP.gridCellSize),
            y: Math.floor(obs.y / OBSTACLE_MAP.gridCellSize),
            width: Math.ceil(obs.width / OBSTACLE_MAP.gridCellSize),
            height: Math.ceil(obs.height / OBSTACLE_MAP.gridCellSize)
        }))
    };
}

// Функция для проверки есть ли препятствие в точке
export function hasObstacle(x, y) {
    return OBSTACLE_MAP.obstacles.some(obs => 
        x >= obs.x && x < obs.x + obs.width &&
        y >= obs.y && y < obs.y + obs.height
    );
}

// Визуализация препятствий на карте (для отладки)
export function visualizeObstacles(map) {
    OBSTACLE_MAP.obstacles.forEach(obs => {
        const bounds = [
            [obs.y, obs.x],
            [obs.y + obs.height, obs.x + obs.width]
        ];
        
        const rectangle = L.rectangle(bounds, {
            color: '#ff0000',
            weight: 1,
            fillColor: '#ff0000',
            fillOpacity: 0.2,
            interactive: false
        });
        
        rectangle.addTo(map);
    });
}
