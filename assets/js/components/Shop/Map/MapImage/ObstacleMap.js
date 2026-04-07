// Obstacle definitions (shelves, walls) and walkable areas for the shop
// Coordinates in pixels relative to the map

import L from "leaflet";

export const OBSTACLE_MAP = {
    // Debug mode - shows obstacles on the map as red rectangles
    debugMode: true,
    // Map dimensions
    mapWidth: 1653,
    mapHeight: 993,
    
    // Grid size for pathfinding (smaller = more accurate, but slower)
    // Increased for smoother routes
    gridCellSize: 10, // 10 pixels = 1 grid cell
    
    // Obstacles (shelves, walls) - loaded from API
    obstacles: [],
    
    // Walkable areas (corridors between shelves)
    // If not specified - entire map is walkable except obstacles
    walkableAreas: null // null = entire map is walkable (except obstacles)
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

// Load obstacles from API for a specific shop
export async function loadObstaclesForShop(shopId) {
    try {
        const response = await fetch(`/api/shops/${shopId}/obstacles`);
        if (!response.ok) {
            console.warn('Failed to load obstacles from API, using empty array');
            OBSTACLE_MAP.obstacles = [];
            return [];
        }
        
        const obstacles = await response.json();
        
        // Convert API data to pathfinding format
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

// Function to generate grid taking obstacles into account
export function generateWalkableGrid() {
    const gridWidth = Math.ceil(OBSTACLE_MAP.mapWidth / OBSTACLE_MAP.gridCellSize);
    const gridHeight = Math.ceil(OBSTACLE_MAP.mapHeight / OBSTACLE_MAP.gridCellSize);
    
    // Create fully walkable grid
    const walkableAreas = [];
    
    if (OBSTACLE_MAP.walkableAreas === null) {
        // Entire map is walkable by default
        walkableAreas.push({
            x: 0,
            y: 0,
            width: gridWidth,
            height: gridHeight
        });
    } else {
        // Use specified walkable areas
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

// Function to check if there is an obstacle at a point
export function hasObstacle(x, y) {
    const yAdmin = OBSTACLE_MAP.mapHeight - y;
    return OBSTACLE_MAP.obstacles.some(obs => 
        x >= obs.x && x < obs.x + obs.width &&
        yAdmin >= obs.y && yAdmin < obs.y + obs.height
    );
}

// Visualize obstacles on the map (for debugging)
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
