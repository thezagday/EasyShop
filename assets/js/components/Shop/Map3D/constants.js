// Map dimensions in admin coords (pixels)
export const MAP_WIDTH = 1653;
export const MAP_HEIGHT = 993;

// Scale factor: admin pixels → Three.js units
// 1 admin pixel = 0.01 Three.js units, so the map is ~16.5 x 9.9 units
export const SCALE = 0.01;

export const HALF_W = (MAP_WIDTH * SCALE) / 2;
export const HALF_H = (MAP_HEIGHT * SCALE) / 2;

// Convert admin coordinates (Y-down, 0,0=top-left) to Three.js world coords.
// PlaneGeometry rotated -PI/2 around X:
//   image top-left  (0,0)         → world (-W/2, 0, -H/2)
//   image bot-right  (1653,993)   → world (+W/2, 0, +H/2)
// So: admin X → (x * SCALE - HALF_W),  admin Y → (y * SCALE - HALF_H)
export function adminToThree(x, y) {
    return [x * SCALE - HALF_W, 0, y * SCALE - HALF_H];
}
