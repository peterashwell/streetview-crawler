// New program
// Start at some point, get near points using API
// Keep track of points visited, expand out, breadth first
// Stop at boundary or all points visited
var svInstance = new google.maps.StreetViewService();
var allPanoramas = {};

function initialize() {
    console.log('initializing...');
    var harbourBridge = new google.maps.LatLng(-33.852001,151.211058);
    var clovelly = new google.maps.LatLng(-33.9049699,151.2510592);
    var panoramaOptions = {
        position: clovelly /*harbourBridge*/
    };
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions
    );
    
    // This is when the links have loaded in the panorama
    google.maps.event.addListener(panorama, 'links_changed', function() {
        // getPanoramaById results are not like javascript pano objects
        // Convert into svInstance result so our function behaves consistently 
        svInstance.getPanoramaById(panorama.getPano(), function(result) {
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
                if (Object.keys(allPanoramas).length < 50) {
                    findNearbyPanoramas(newData);
                }
            });
        }
    }

    if (pano.links) {
        pano.links.forEach(visitLink);
    }
}

google.maps.event.addDomListener(window, 'load', initialize);
