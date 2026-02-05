// Определение препятствий (стеллажи, стены) и проходимых зон для магазина
// Координаты в пикселях относительно карты

import L from "leaflet";

export const OBSTACLE_MAP = {
    // Режим отладки - показывает препятствия на карте красными прямоугольниками
    debugMode: true,
    // Размеры карты
    mapWidth: 1653,
    mapHeight: 993,
    
    // Размер сетки для pathfinding (чем меньше - тем точнее, но медленнее)
    // Увеличен для более плавных маршрутов
    gridCellSize: 10, // 20 пикселей = 1 клетка сетки
    
    // Препятствия (стеллажи, стены) - загружаются из API
    obstacles: [],
    
    // Проходимые зоны (коридоры между стеллажами)
    // Если не указаны - вся карта проходима кроме obstacles
    walkableAreas: null // null = вся карта проходима (кроме obstacles)
};

function getLeafletObstacleBounds(obs) {
    const y = OBSTACLE_MAP.mapHeight - (obs.y + obs.height);
    return {
        x: obs.x,
        y,
        width: obs.width,
        height: obs.height,
        bounds: [
            [y, obs.x],
            [y + obs.height, obs.x + obs.width]
        ]
    };
}

// Загрузить препятствия из API для конкретного магазина
export async function loadObstaclesForShop(shopId) {
    try {
        const response = await fetch(`/api/shops/${shopId}/obstacles`);
        if (!response.ok) {
            console.warn('Failed to load obstacles from API, using empty array');
            OBSTACLE_MAP.obstacles = [];
            return [];
        }
        
        const obstacles = await response.json();
        
        // Преобразуем данные из API в формат для pathfinding
        OBSTACLE_MAP.obstacles = obstacles.map(obs => ({
            x: obs.x,
            y: obs.y,
            width: obs.width,
            height: obs.height
        }));
        
        console.log('✅ Loaded', obstacles.length, 'obstacles from API');
        return OBSTACLE_MAP.obstacles;
    } catch (error) {
        console.error('Error loading obstacles:', error);
        OBSTACLE_MAP.obstacles = [];
        return [];
    }
}

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
        obstacles: OBSTACLE_MAP.obstacles.map(obs => {
            const t = getLeafletObstacleBounds(obs);
            return {
                x: Math.floor(t.x / OBSTACLE_MAP.gridCellSize),
                y: Math.floor(t.y / OBSTACLE_MAP.gridCellSize),
                width: Math.ceil(t.width / OBSTACLE_MAP.gridCellSize),
                height: Math.ceil(t.height / OBSTACLE_MAP.gridCellSize)
            };
        })
    };
}

// Функция для проверки есть ли препятствие в точке
export function hasObstacle(x, y) {
    const yAdmin = OBSTACLE_MAP.mapHeight - y;
    return OBSTACLE_MAP.obstacles.some(obs => 
        x >= obs.x && x < obs.x + obs.width &&
        yAdmin >= obs.y && yAdmin < obs.y + obs.height
    );
}

// Визуализация препятствий на карте (для отладки)
export function visualizeObstacles(map) {
    if (OBSTACLE_MAP._visualLayerGroup) {
        map.removeLayer(OBSTACLE_MAP._visualLayerGroup);
        OBSTACLE_MAP._visualLayerGroup = null;
    }

    const group = L.layerGroup();

    OBSTACLE_MAP.obstacles.forEach(obs => {
        const { bounds } = getLeafletObstacleBounds(obs);
        
        const rectangle = L.rectangle(bounds, {
            color: '#ff0000',
            weight: 3,
            fillColor: '#ff0000',
            fillOpacity: 0.5,
            interactive: false
        });
        
        rectangle.addTo(group);
    });

    group.addTo(map);
    OBSTACLE_MAP._visualLayerGroup = group;
    return group;
}
