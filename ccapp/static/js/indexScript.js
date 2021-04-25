

//
// Event listener registration
//

// Hooks the onLoad function to the DOMContentLoaded event.
document.addEventListener('DOMContentLoaded', onLoad);

//
// Globals
//

let collegeLocations = 
  [{"UNITID":48312402,"NAME":"Arizona State University","CITY":"Lake Havasu City","LAT":34.47278,"LON":-114.321591},
  {"UNITID":137351,"NAME":"University of South Florida","CITY":"Tampa","LAT":28.061458,"LON":-82.413232},
  {"UNITID":236948,"NAME":"University of Washington","CITY":"Seattle","LAT":47.65538,"LON":-122.30514}];
  

//
// Constants
//

const US_GEOGRAPHICAL_CENTER = {lat: 39.50, lng: -98.35};
const MINIMUM_DEGREES_SEPARATION = 2.5;
const ENTER_KEYCODE = 13;

//
// Functions
//

/**
 * Fires as soon as the DOM is loaded.
 */
async function onLoad() {
  // collegeLocations = await (await fetch('./assets/college-locations.json')).json();
  
  addMapToPage();

  // Grab the datalist and remove its ID (destroying the select-datalist relationship),
  // to improve performance while adding the options to the datalist.
  const collegeDataList = document.getElementById('colleges');
  collegeDataList.removeAttribute('id');

  // Add all colleges as datalist options. We use a document fragment because the
  // DOM is slow if we add each option individually and let the DOM update in between.
  const fragment = document.createDocumentFragment();
  collegeLocations.forEach((location) => {
    const newOption = document.createElement('option');
    newOption.setAttribute('data-value', location.UNITID);
    newOption.value = location.NAME;

    fragment.appendChild(newOption);
  });

  // Add the options and restore the select-datalist relationship.
  collegeDataList.appendChild(fragment);
  collegeDataList.setAttribute('id', 'colleges');

  // When users select an option from the dropdown, send them to that page.
  document.getElementById('colleges-input').addEventListener('change', navigateUserToCollegePage);
  document.getElementById('colleges-input').addEventListener('keypress', navigateUserOnEnter);
}

/**
* Tries to add the map to the page. The map URL calls the initMap() function as
* its callback, which then positions the map and adds markers. If we are unable
* to retrieve the secret for the map, then we display an error to the user.
*/
function addMapToPage() {
  // getSecretFor('javascript-maps-api').then((key) => {
  //   if (key === null) {
  //     const mapElement = document.getElementById('map-info-container');
  //     const errorElement = document.createElement('div');
  //     errorElement.setAttribute('id', 'map-error');
  //     errorElement.innerText = `An error occured while fetching the credentials
  //                               needed to view the map. Try refreshing the page;
  //                               if the error persists, please contact us above.`;
  //     mapElement.appendChild(errorElement);
  //     return;
  //   }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD6h8yj2Jd7-8q6lcxifInxtR8Ptv3aztg&callback=initMap`;
    script.defer = true;
    script.async = true;
    window.initMap = initMap;
    document.head.appendChild(script);
  // });
}

/**
 * Initializes the embedded Google Maps map.
 */
function initMap() {
  // Turn off the labels on the map and change the water color
  // so that the map fits the landing page's aesthetic better.
  
  const map = new google.maps.Map(document.getElementById('map'),
      {
        center: {lat: US_GEOGRAPHICAL_CENTER.lat, lng: US_GEOGRAPHICAL_CENTER.lng},
        zoom: 3,
        disableDefaultUI: true,
        styles: [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{color: '#f0f5f7'}],
          },
          {
            featureType: 'all',
            elementType: 'labels',
            stylers: [
              {visibility: 'off'},
            ],
          },
        ],
      },
  );
      
  // We only show 30 of the colleges to the user because a
  // map with thousands of pins doesn't look good.
  // const representativeColleges = collegeLocations;
  // let rlen = 10;
  // const lessColleges =
  //   new Array(5)
  //       .fill(0)
  //       .map((c) => Math.floor(Math.random() * rlen))
  //       .map((i) => representativeColleges[i]);
  col = new Array(10)
      for (k in collegeLocations){
          col[k] = collegeLocations[k]
      }

        for (college in col){
          const marker = new google.maps.Marker({
            position: {lat: col[college]["LAT"], lng: col[college]["LON"]},
            map: map,
            title: col[college]["NAME"],
          });
      
          marker.addListener('click', function() {
            window.location.href = `/find-events.html?collegeid=${col[college]["UNITID"]}`;
          });
        }
        }
  

/**
 * Gets a relatively evenly spaced sample of a bunch of colleges
 * throughout the U.S. to place on the landing page's map. By capping
 * the colleges in high-density areas, rural areas will be more likely
 * to have pins on the map and feel more represented by the graphic.
 * @param {array} collegeLocations - All possible college locations.
 * @return {array} - A list of colleges that are evenly spaced.
 */
function getRepresentativeCollegeSample(collegeLocations) {
  // Seed the final array with a single random college so that each run
  // provides a different array of colleges.
  const representativeColleges =
    [collegeLocations[Math.floor(Math.random() * collegeLocations.length)]];

  // Cycling through every college, we check if it's at least MINIMUM_DEGREES_SEPARATION
  // away from all other previously chosen colleges, and only select it if it is.
  while (representativeColleges.length < 30) {
    const randomCollege = collegeLocations[Math.floor(Math.random() * collegeLocations.length)];
    let collegeFarAwayEnough = true;

    for (const comparisonCollege of representativeColleges) {
      if (Math.abs(randomCollege.LAT - comparisonCollege.LAT) < MINIMUM_DEGREES_SEPARATION &&
        Math.abs(randomCollege.LON - comparisonCollege.LON) < MINIMUM_DEGREES_SEPARATION) {
        collegeFarAwayEnough = false;
        break;
      }
    }

    if (collegeFarAwayEnough) {
      representativeColleges.push(randomCollege);
    }
  }

  return representativeColleges;
}

/**
 * When the user selects a college from the dropdown, we immediately
 * navigate them to the appropriate college's page.
 */
function navigateUserToCollegePage() {
  const collegeName = document.getElementById('colleges-input').value;
  const titleCaseCollegeName = collegeName
      .split(' ')
      .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
      .join(' ');
  // Try the title case version if what the user passed in doesn't match anything
  const option = document.querySelector(`#colleges option[value='${collegeName}']`) ?
      document.querySelector(`#colleges option[value='${collegeName}']`) :
      document.querySelector(`#colleges option[value='${titleCaseCollegeName}']`);

  // Only navigate to the page if that college exists in our list of colleges.
  // TODO: display 'We haven't heard of that college!"/similar to the user if not recognized.
  if (option) {
    const collegeId = option.dataset.value;
    window.location.href = `/find-events.html?collegeid=${collegeId}`;
  }
}

/**
 * Checks if the user pressed 'enter' in the dropdown, and if they did,
 * navigate them to the appropriate college's page.
 */
function navigateUserOnEnter() {
  if (event.keyCode === ENTER_KEYCODE) {
    navigateUserToCollegePage();
  }
}
