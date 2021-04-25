
//
// Event listener registration
//

// Hooks the onLoad function to the DOMContentLoaded event.
document.addEventListener('DOMContentLoaded', onLoad);

//
// Constants
//

const GOOGLEPLEX_LOCATION = {lat: 37.4225, lng: -122.084};

//
// Functions
//

/**
 * Fires as soon as the DOM is loaded.
 */
async function onLoad() {
  addMapToPage();
}

/**
* Tries to add the map to the page. The map URL calls the initMap() function as
* its callback, which then positions the map and adds markers. If we are unable
* to retrieve the secret for the map, then we display an error to the user.
*/
function addMapToPage() {
  getSecretFor('javascript-maps-api').then((key) => {
    if (key === null) {
      const mapElement = document.getElementById('map-info-container');
      const errorElement = document.createElement('div');
      errorElement.setAttribute('id', 'map-error');
      errorElement.innerText = `An error occured while fetching the credentials
                                needed to view the map. Try refreshing the page;
                                if the error persists, please contact us above.`;
      mapElement.appendChild(errorElement);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`;
    script.defer = true;
    script.async = true;
    window.initMap = initMap;
    document.head.appendChild(script);
  });
}

/**
 * Initializes the embedded Google Maps map.
 */
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'),
      {
        center: {lat: GOOGLEPLEX_LOCATION.lat, lng: GOOGLEPLEX_LOCATION.lng},
        zoom: 17,
        disableDefaultUI: true,
      },
  );

  new google.maps.Marker({
    position: {lat: GOOGLEPLEX_LOCATION.lat, lng: GOOGLEPLEX_LOCATION.lng},
    map: map,
    title: 'Googleplex',
  });
}
