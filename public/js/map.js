maptilersdk.config.apiKey = mapApi;

// Parse the coordinates from string to array
const coordinates = JSON.parse(window.coordinates);

const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: maptilersdk.MapStyle.BRIGHT,
    center: coordinates, 
    zoom: 9,
});

const marker = new maptilersdk.Marker({color : 'red'})
    .setLngLat(coordinates)  // listing.geometry.coordinates
    .setPopup(new maptilersdk.Popup({offset: 25}).setHTML(`
        <h4> ${listingTitle} </h4>
        <p>Exact location will be provided after booking</p>
    `))
    .addTo(map);