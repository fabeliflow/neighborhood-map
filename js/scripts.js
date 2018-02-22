// Materialize slide list button - source: http://materializecss.com/side-nav.html
$('.button-collapse').sideNav({
    menuWidth: 300, // Default is 300
    edge: 'left', // Choose the horizontal origin
    closeOnClick: true, // Closes side-nav on <a> clicks
    draggable: true, // Choose whether you can drag to open on touch screens
}
);

// Global map and infoWindow
var map;
var infoWindow;

// Icon states
var defaultIcon;
var highlightedIcon;

// Foursquare API - source: https://developer.foursquare.com/docs/api/venues/details
var clientID = 'SSYLTBH3DBHQJZQ3P3SGSST0TSIVCPTCMBZXVAKC0L02BY41';
var clientSecret = '0ETDWC4Z115BAYTYOW3OBEK3NIBHPNAK30OXBHBXKBFUWBAA';

// Create a new blank array for all the listing markers
var markers = [];

// Initialize google map
function initMap() {

    // Map options
    var westchase = { lat: 28.0620207, lng: -82.648394 };

    // Styles from snazzymaps - source: https://snazzymaps.com/style/151/ultra-light-with-labels
    var mapOptions = {
        center: westchase,
        zoom: 13,
        styles: [
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e9e9e9"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 17
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 29
                    },
                    {
                        "weight": 0.2
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 18
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dedede"
                    },
                    {
                        "lightness": 21
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "on"
                    },
                    {
                        "color": "#ffffff"
                    },
                    {
                        "lightness": 16
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "saturation": 36
                    },
                    {
                        "color": "#333333"
                    },
                    {
                        "lightness": 40
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    },
                    {
                        "lightness": 19
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#fefefe"
                    },
                    {
                        "lightness": 20
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#fefefe"
                    },
                    {
                        "lightness": 17
                    },
                    {
                        "weight": 1.2
                    }
                ]
            }
        ],
        mapTypeControl: false,
        draggable: false
    }

    // Instantiate infoWindow and map
    infoWindow = new google.maps.InfoWindow();

    // Udacity Google API course: https://classroom.udacity.com/nanodegrees/nd001/parts/91561162-9864-4caf-b2aa-e6504385e4e2/modules/4fd8d440-9428-4de7-93c0-4dca17a36700/lessons/8304370457/concepts/83061122970923
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Make sure the map stays centered on resize
    google.maps.event.addDomListener(window, 'resize', function () {
        var center = map.getCenter();
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
    });

    // Westchase places of interest
    var westchasePOI = [
        { title: 'Catch Twenty Three', location: { lat: 28.0433568, lng: -82.5970998 } },
        { title: 'Senor Tequila', location: { lat: 28.069344, lng: -82.6361983 } },
        { title: 'Ed Radice Sports Complex', location: { lat: 28.0829266, lng: -82.6085566 } },
        { title: 'Maureen B. Gauzza Regional Library', location: { lat: 28.018859, lng: -82.6127279 } },
        { title: 'Westfield Citrus Park', location: { lat: 28.0689622, lng: -82.5787818 } }
    ];

    // Knockout bindings - source: http://learn.knockoutjs.com/#/?tutorial=collections
    ko.applyBindings(new MapViewModel(westchasePOI));
}

// This function makes an API call (Foursquare), retrieves the data and sends it to the infowindow
function ExternalApi(marker) {

    var self = this;

    // Get marker info for data retrieval
    self.lat = marker.position.lat();
    self.lng = marker.position.lng();
    self.title = marker.title;

    self.infoContent;

    // Venue info
    self.venueName;
    self.venueAddress;
    self.venuePhone;
    self.venueFormattedPhone;

    // API URL
    var apiURL = 'https://api.foursquare.com/v2/venues/search?ll=' + self.lat + ',' + self.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&query=' + self.title + '&v=20170801';

    // This function handles a successful Http request
    function handleSuccess() {

        // Retrieve the data from Foursquare (JSON)
        var data = JSON.parse(this.responseText).response.venues[0];

        self.venueName = data.name;
        self.venueAddress = data.location.address;
        self.venuePhone = data.contact.phone;
        self.venueFormattedPhone = data.contact.formattedPhone;

        // Create info window content elements
        self.infoContent = '<div class="venueInfo">';

        // If we have data, make sure each data piece is available. If so, add it to our
        // info window content
        if (data) {

            if (self.venueName !== undefined) {
                self.infoContent += '<h3>' + self.venueName + '</h3>';
            }

            if (self.venueAddress !== undefined) {

                self.infoContent += '<address>' + self.venueAddress + '</address>';
            }

            if (self.venuePhone !== undefined && self.venueFormattedPhone !== undefined) {

                self.infoContent += '<a href="tel:+1-' + self.venuePhone + '">' + self.venueFormattedPhone + '</a>';
            }

        } else {

            self.infoContent = 'No info found :(';
        }

        self.infoContent += '</div>';

        // Pass retrieved data to info window
        populateInfoWindow(marker, infoContent);
    }

    // Ajax with XHR - source: https://classroom.udacity.com/nanodegrees/nd001/parts/91561162-9864-4caf-b2aa-e6504385e4e2/modules/3cc28649-e29e-4095-8dc9-d7943de84d87/lessons/8cb1042e-3260-469c-9f78-8e2f092a4725/concepts/39d3a627-aa6c-4123-8579-0495fdb32e8e
    const asyncRequestObject = new XMLHttpRequest();
    asyncRequestObject.open('GET', apiURL);
    asyncRequestObject.onload = handleSuccess;
    asyncRequestObject.send();
}

// Map viewmodel
function MapViewModel(places) {

    var self = this;

    // Points of interest list (will change based on filtering)
    self.listPOI = ko.observableArray();

    places.forEach(function (place) {
        self.listPOI.push(new Marker(place.location, place.title));
    });

    // Extend the boundaries of the map for each marker and display the marker
    var bounds = new google.maps.LatLngBounds();

    markers.forEach(function (marker) {
        marker.setMap(map);
        bounds.extend(marker.position);
    });

    map.fitBounds(bounds);

    // Animate selected marker and send it to the api call function
    self.openMarkerInfo = function (clickedPlace) {

        clickedPlace.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () { clickedPlace.marker.setAnimation(null); }, 750);

        ExternalApi(clickedPlace.marker);
    };

    // Filter POI - modified from this example: http://jsfiddle.net/zf5k9rxq
    self.query = ko.observable("");

    self.filteredPOI = ko.computed(function () {

        var filter = self.query().toLowerCase();

        if (!filter) {

            // If not filtered, show all markers and places in the list
            ko.utils.arrayFilter(self.listPOI(), function (item) {

                item.marker.setVisible(true);
            });

            return self.listPOI();

        } else {

            return ko.utils.arrayFilter(self.listPOI(), function (item) {

                // Return the filtered places (markers and list)
                var result = (item.title.toLowerCase().search(filter) >= 0);
                item.marker.setVisible(result);

                // Reset pin colors
                defaultColorPin();

                return result;
            });
        }
    });
}

// Creates a location marker
function Marker(location, title) {

    var self = this;

    self.location = location;
    self.title = title;

    // Marker icon (default and highlighted)
    defaultIcon = makeMarkerIcon('26a69a');

    highlightedIcon = makeMarkerIcon('ccff66');

    self.marker = new google.maps.Marker({
        position: this.location,
        title: this.title,
        animation: google.maps.Animation.DROP,
        icon: defaultIcon,
        map: map
    });

    // Push the marker to our array of markers
    markers.push(self.marker);

    // Create an onclick event to open the large infowindow at each marker
    self.marker.addListener('click', function () {
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () { self.marker.setAnimation(null); }, 750);

        ExternalApi(this);
    });

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34)
    function makeMarkerIcon(markerColor) {

        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));

        return markerImage;
    }
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position
function populateInfoWindow(marker, infoContent) {

    // Check to make sure the infowindow is not already opened on this marker
    if (infoWindow.marker != marker) {

        // Clear the infowindow content
        infoWindow.setContent('');
        infoWindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow is closed
        infoWindow.addListener('closeclick', function () {
            infoWindow.marker = null;
            marker.setIcon(defaultIcon);
        });

        defaultColorPin();

        marker.setIcon(highlightedIcon);

        infoWindow.setContent(infoContent);

        // Open the infowindow on the correct marker.
        infoWindow.open(map, marker);
    }
}

// This function resets pins to default
function defaultColorPin() {
    markers.forEach(function (marker) {
        marker.setIcon(defaultIcon);
    });

    infoWindow.close();
}

// Map error handler
function googleMapsError() {
    alert('Oops! Something went wrong!');
}