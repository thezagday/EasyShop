import L from "leaflet";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export function SetupMap(map) {
    const bounds = [[0, 0], [993, 1653]];
    const image = L.imageOverlay("/img/map.svg", bounds).addTo(map);

    map.fitBounds(image.getBounds());
    map.setMaxBounds(map.getBounds());
}