[x] loading and crawling panoramas
[x] manually generate link for image part using lat/lng + elevation
[x] dump panoramas found to text file
[ ] script to generate images and fetch them in python
[ ] manually inspect downloaded images
[ ] apply to region in darlinghurst

Loading and crawling panoramas
==============================
 - use streetview api to fetch linked panoaramas
 - key data type is the StreetViewPanoramaData object, hard to find info about
 - interested in heading of vehicle - StreetViewPanorama.getPhotographerPov()

Manually generate link for image part using lat/lng + elevation
===============================================================

First attempt:
 - use fov of about 30 degrees
 - use pitch of -5 degrees
 - images come in max 600x600 unless you get biz account: 2400x2400
 - attempted to contact sales to register for the service
 - example: https://maps.googleapis.com/maps/api/streetview?size=600x600&location=-33.9049799,151.2510592&heading=200&pitch=-5&fov=30
 - can also use 'pano' parameter for panorama ID


Dump panoramas found to text file
=================================
 - can be done using blob: http://stackoverflow.com/questions/8178825/create-text-file-in-javascript
 - use window.open(blobUrl) rather than dodgy shit with a link

Script to generate images and fetch them in python
==================================================
 - just use wget -i <file-with-images-list-in>
