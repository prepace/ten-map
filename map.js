// Initialize map
var map = L.map('map').setView([33.5, -116.1], 9);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OSM contributors' }).addTo(map);

// --- Sites layer ---
var sitesLayer = L.geoJSON(sites, {
    onEachFeature: function (f, l) {
        var idx = sites.features.indexOf(f);
        var p = f.properties;
        var html =
            '<h3>' + p.Name + '</h3>' +
            '<p><strong>Tribe:</strong> ' + p.Tribe + '<br>' +
            '<strong>Address:</strong> ' + p.Address + '<br>' +
            '<strong>Phone:</strong> ' + p.Phone + '<br>' +
            '<a href="' + p.Website + '" target="_blank">' + p.Website + '</a></p>';
        l.bindPopup(html);
        l.on('click', function () {
            document.querySelectorAll('#sidebar-list li')
                .forEach(el => el.classList.remove('highlight'));
            var li = document.getElementById('sidebar-item-' + idx);
            li.classList.add('highlight');
            li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
}).addTo(map);

// Populate sidebar list
sites.features.forEach(function (f, i) {
    var li = document.createElement('li');
    li.id = 'sidebar-item-' + i;
    li.textContent = f.properties.Name;
    document.getElementById('sidebar-list').appendChild(li);
    li.onclick = function () {
        document.querySelectorAll('#sidebar-list li')
            .forEach(el => el.classList.remove('highlight'));
        li.classList.add('highlight');
        sitesLayer.getLayers()[i].openPopup();
        map.panTo(sitesLayer.getLayers()[i].getLatLng());
    };
});

// --- EVs layer ---
var evsLayer = L.geoJSON(evs, {
    pointToLayer: function (f, ll) {
        var count = f.properties['Number of Vehicles'];
        return L.marker(ll, {
            icon: L.divIcon({
                className: 'ev-label',
                html: '<div class="ev-count-label">' + count + '</div>',
                iconSize: null
            })
        });
    }
});

// --- DCFC layer ---
var dcfcLayer = L.geoJSON(dcfc, {
    pointToLayer: function (f, ll) {
        var cnt = f.properties['EV DC Fast Count'];
        return L.marker(ll, {
            icon: L.divIcon({
                className: 'dcfc-label',
                html: '<div class="dcfc-count-label">' + cnt + '</div>',
                iconSize: null
            })
        });
    }
});

// --- AADT layer ---
// var aadtLayer = L.geoJSON(aadt, {
//     pointToLayer: function (f, ll) {
//         var back = f.properties.BACK_AADT || '';
//         var ahead = f.properties.AHEAD_AADT || '';
//         return L.marker(ll, {
//             icon: L.divIcon({
//                 className: 'aadt-label',
//                 html: '<div class="aadt-count-label">' + back + ' - ' + ahead + '</div>',
//                 iconSize: null
//             })
//         });
//     }
// });

// --- Layer toggles ---
// document.getElementById('toggle-sites').addEventListener('change', function (e) {
//     if (e.target.checked) map.addLayer(sitesLayer);
//     else map.removeLayer(sitesLayer);
// });
document.getElementById('toggle-evs').addEventListener('change', function (e) {
    if (e.target.checked) map.addLayer(evsLayer);
    else map.removeLayer(evsLayer);
});
document.getElementById('toggle-dcfc').addEventListener('change', function (e) {
    if (e.target.checked) map.addLayer(dcfcLayer);
    else map.removeLayer(dcfcLayer);
});
// document.getElementById('toggle-aadt').addEventListener('change', function (e) {
//     if (e.target.checked) map.addLayer(aadtLayer);
//     else map.removeLayer(aadtLayer);
// });

// Fit all visible layers
// const allLayers = L.featureGroup([sitesLayer, evsLayer, dcfcLayer, aadtLayer]);
const allLayers = L.featureGroup([sitesLayer, evsLayer, dcfcLayer]);
map.fitBounds(sitesLayer.getBounds());