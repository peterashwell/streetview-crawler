// New program
// Start at some point, get near points using API
// Keep track of points visited, expand out, breadth first
// Stop at boundary or all points visited
var svInstance = new google.maps.StreetViewService();
var allPanoramas = {};
var map = null;
var panorama = null;
var MAX_PANORAMAS_FETCHED = 10000;

// Sample locations
var clovelly = new google.maps.LatLng(-33.9049699,151.2510592);
var harbourBridge = new google.maps.LatLng(-33.852001,151.211058);
var darlinghurst = new google.maps.LatLng(-33.879214,151.21527);

function initialize() {
    console.log('initializing...');
    
    drawPanorama();
    drawMap();

    document.getElementById('generate-data').addEventListener('click', generateData);
}

function drawPanorama() {
    var panoramaOptions = {
        position: darlinghurst /*harbourBridge*/
    };
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions
    );

    // This is when the links have loaded in the panorama
    google.maps.event.addListener(panorama, 'links_changed', function() {
        // getPanoramaById results are not like javascript pano objects
        // Convert into svInstance result so our function behaves consistently 
        svInstance.getPanoramaById(panorama.getPano(), function(result) {
            allPanoramas[panorama.getPano()] = result;
            findNearbyPanoramas(result);
        });
        google.maps.event.addListener(panorama, 'position_changed', function() {
            var id = panorama.getPano();
            var newPano = new sv.getPanoramaById(id, function(newData) {
                console.log('new pano:', newData.links);
            });
        });
    });
}

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
                console.log('found panorama, collection now:', allPanoramas);
                debugger;
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

function generateData() {
    var textFile = null;

    var text = 'panoId\tlat\tlng\n';
    for (var panoId in allPanoramas) {
        if (allPanoramas.hasOwnProperty(panoId)) {
            var pano = allPanoramas[panoId],
                lat = pano.location.latLng.lat(),
                lng = pano.location.latLng.lng();
            text += panoId + '\t' + lat + '\t' + lng + '\n';
            console.debug('building txt with:', pano);
        }
    }

    var data = new Blob([text], {type: 'text/plain'});
    var textFile = window.URL.createObjectURL(data);

    window.open(textFile);
}

google.maps.event.addDomListener(window, 'load', initialize);
