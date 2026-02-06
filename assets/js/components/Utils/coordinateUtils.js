import L from "leaflet";

const MAP_HEIGHT = 993;

let yx = L.latLng;
export let xy = function (x, y) {
    if (Array.isArray(x)) {    // When doing xy([x, y]);
        return yx(x[1], x[0]);
    }
    return yx(y, x);  // When doing xy(x, y);
};

// Convert admin/DB coordinates (Y-down, 0,0 = top-left) to Leaflet CRS.Simple (Y-up, 0,0 = bottom-left)
export function adminToLeaflet(x, y) {
    return xy(x, MAP_HEIGHT - y);
}