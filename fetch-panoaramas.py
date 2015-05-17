# Open panorama file which has the format
# <google-panorama-id>\t<lat>\t<lng>
# ...

from urllib.parse import urlencode

SV_IMG_URL = 'https://maps.googleapis.com/maps/api/streetview'
SV_PARAMS = {
    'size': '600x600',
    'fov': 40
}

panorama_file = 'panoramas.txt'


def generate_view_urls(pid, lat, lng):
    params = {
        'pano': pid,
        'latitude': lat,
        'longitude': lng,
        'size': SV_PARAMS['size'],
        'fov': SV_PARAMS['fov']
    }
    # Capture all headings at 30deg increments
    for headingDeg in range(0, 360, 30):
        params['heading'] = headingDeg
        print('{0}?{1}'.format(SV_IMG_URL, urlencode(params)))


with open(panorama_file) as panoramas:
    for p in panoramas:
        pid, lat, lng = p.split()
        generate_view_urls(pid, lat, lng)
