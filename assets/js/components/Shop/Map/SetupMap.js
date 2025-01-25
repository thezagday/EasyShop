import L from "leaflet";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export function SetupMap(map) {
    const bounds = [[-30.68, -30.68], [1048.86, 1048.86]];
    const image = L.imageOverlay("/img/starmap-1.png", bounds).addTo(map);

    map.fitBounds(image.getBounds());
    map.setMaxBounds(map.getBounds());
}