// New program
// Start at some point, get near points using API
// Keep track of points visited, expand out, breadth first
// Stop at boundary or all points visited
var svInstance = new google.maps.StreetViewService();
var allPanoramas = {};
var map = null;
var panorama = null;
var MAX_PANORAMAS_FETCHED = 3;

// Sample locations
var clovelly = new google.maps.LatLng(-33.9049699,151.2510592);
var harbourBridge = new google.maps.LatLng(-33.852001,151.211058);
var darlinghurst = new google.maps.LatLng(-33.879214,151.21527);

// Add the panorama to the screen as a basis for the scraping
// Add a map showing where we are fetching panoramas
function initialize() {
    console.log('initializing...');
    
    drawPanorama();
    drawMap();

    document.getElementById('generate-data').addEventListener('click', generateData);
}

// Create a panorama at a location as a starting point, then crawl outwards
function drawPanorama() {
    var panoramaOptions = {
        position: darlinghurst /*harbourBridge*/
    };
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions
    );

    // This is when the links have loaded in the panorama and we
    // can start crawling
    google.maps.event.addListener(panorama, 'links_changed', function() {
        // getPanoramaById results are not like javascript pano objects
        // Convert into svInstance result so our function behaves consistently 
        svInstance.getPanoramaById(panorama.getPano(), function(result) {
            allPanoramas[panorama.getPano()] = result;
            findNearbyPanoramas(result);
        });
        /*
        google.maps.event.addListener(panorama, 'position_changed', function() {
            var id = panorama.getPano();
            var newPano = new sv.getPanoramaById(id, function(newData) {
                console.log('new pano:', newData.links);
            });
        });
        */
    });
}

// Helper map to show our crawler doing its thing
function drawMap() {
    var mapOptions = {
        zoom: 15,
        center: darlinghurst 
    };
    map = new google.maps.Map(
        document.getElementById('map'), mapOptions
    );
}

// Follow links until boundaries are reached, for every leaf
// panorama hit API endpoint for adjacent (and unlinked) panoramas
// Take list of panoramas, pop them, expand links, recurse, until
// no more panoramas found
function findNearbyPanoramas(pano) {
    // Go to each link, expand it, and add to visited
    function visitLink(link) {
        if (!allPanoramas.hasOwnProperty(link.pano)) {
            svInstance.getPanoramaById(link.pano, function(newData) {
                allPanoramas[newData.location.pano] = newData;
                var marker = new google.maps.Marker({
                    position: newData.location.latLng,
                    map: map,
                    title: 'panorama'
                });
                if (Object.keys(allPanoramas).length < MAX_PANORAMAS_FETCHED) {
                    findNearbyPanoramas(newData);
                }
            });
        }
    }

    if (pano.links) {
        pano.links.forEach(visitLink);
    }
}

// Dump our panorama data to a text file using Blob and createObject
function generateData() {
    var textFile = null;

    // Dump all the panoramas into a gigantic string, tab separated
    var text = 'panoId\tlat\tlng\theading\n';
    for (var panoId in allPanoramas) {
        if (allPanoramas.hasOwnProperty(panoId)) {
            var pano = allPanoramas[panoId];
            var lat = pano.location.latLng.lat(),
                lng = pano.location.latLng.lng(),
                heading = pano.tiles.centerHeading;
            text += panoId + '\t' + lat + '\t' + lng + '\n' + heading + '\n';
            console.debug('building txt with:', pano);
        }
    }

    // Write it to a blob and generate a url for it
    var data = new Blob([text], {type: 'text/plain'});
    var textFile = window.URL.createObjectURL(data);

    // This saves the file
    window.open(textFile);
}

// Initialize the crawler when google maps has loaded
google.maps.event.addDomListener(window, 'load', initialize);
