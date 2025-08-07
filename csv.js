// csv.js — supports both HTTP‐fetch and file‐input without CORS errors

// 1) Initialize map
var map = L.map('map').setView([41.9, -88.3], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OSM contributors'
}).addTo(map);

var sitesLayer = L.layerGroup().addTo(map);

// 2) Utility: clear existing markers & sidebar
function clearSites() {
    sitesLayer.clearLayers();
    document.getElementById('sidebar-list').innerHTML = '';
}

// 3) Tiny CSV parser (same as before)
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.map(line => {
        const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
            .map(c => c.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => obj[h] = cols[i]);
        return obj;
    });
}

// 4) Draw rows (markers + popups + sidebar entries)
function drawRows(rows) {
    clearSites();
    rows.forEach((row, i) => {
        const [lat, lng] = row.Coords.replace('@', '').split(',').map(parseFloat);
        const marker = L.marker([lat, lng]).addTo(sitesLayer);
        // inside your rows.forEach loop, before bindPopup:
        const [street, ...rest] = row.Address.split(', ');
        const cityStateZip = rest.join(', ');


        marker.bindPopup(`
            <div>
                <h3>Property #${row['#']}</h3>
                <p style="font-size:1.2em; margin:0;">
                    ${street}<br>
                    ${cityStateZip}
                </p>
                <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="border:none; text-align:center; padding:4px;">
                    <strong>Units</strong><br>
                    <span style="font-size:1.2em;">${row.Units}</span>
                    </td>
                    <td style="border:none; text-align:center; padding:4px;">
                    <strong>Beds</strong><br>
                    <span style="font-size:1.2em;">${row.Beds}</span>
                    </td>
                    <td style="border:none; text-align:center; padding:4px;">
                    <strong>Baths</strong><br>
                    <span style="font-size:1.2em;">${row.Baths}</span>
                    </td>
                    <td style="border:none; text-align:center; padding:4px;">
                    <strong>SqFt</strong><br>
                    <span style="font-size:1.2em;">${row.SqFt}</span>
                    </td>
                </tr>
                </table>
            </div>
        `);

        const li = document.createElement('li');
        li.id = 'sidebar-item-' + i;
        li.innerHTML = `
            <span class="item-number">${row['#']}</span>
            <span class="item-address">${row.Address}</span>
            <span class="item-bedbath">${row.Beds}/${row.Baths}</span>
            <span class="item-sf">${row.SqFt}</span>
            `;
        document.getElementById('sidebar-list').appendChild(li);

        marker.on('click', () => {
            document.querySelectorAll('#sidebar-list li')
                .forEach(el => el.classList.remove('highlight'));
            li.classList.add('highlight');
            li.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        li.addEventListener('click', () => {
            document.querySelectorAll('#sidebar-list li')
                .forEach(el => el.classList.remove('highlight'));
            li.classList.add('highlight');
            marker.openPopup();
            map.panTo(marker.getLatLng());
        });
    });

    if (sitesLayer.getLayers().length) {
        map.fitBounds(sitesLayer.getBounds());
    }
}

// 5) Load CSV from URL (only if served via http/https)
function loadFromUrl(url) {
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
            return res.text();
        })
        .then(text => drawRows(parseCSV(text)))
        .catch(err => console.error(err));
}

// 6) Load CSV from a File object
function loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = e => drawRows(parseCSV(e.target.result));
    reader.readAsText(file);
}

// 7) Wire up controls

// If we're on HTTP/HTTPS, enable the dropdown and auto‐load the first CSV
if (location.protocol.startsWith('http')) {
    const selector = document.getElementById('csv-selector');
    if (selector) {
        selector.addEventListener('change', () => loadFromUrl(selector.value));
        loadFromUrl(selector.value);
    }
}

// Always wire up the file‐input, so it works under file:// too
const fileInput = document.getElementById('csv-file-input');
if (fileInput) {
    fileInput.addEventListener('change', evt => {
        const file = evt.target.files[0];
        if (file) loadFromFile(file);
    });
}
