import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';

const LoginMap = () => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    getBranches();
  }, []);

  const getBranches = async () => {
    try {
      const response = await axios.get(
        'http://192.168.31.237:5021/api/Branch/GetAllBranchesLocation'
      );

      const locations = response?.data?.data || [];

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<style>
html,
body,
#map {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.leaflet-popup-content {
  min-width: 220px;
}

.info {
  font-size: 14px;
  line-height: 20px;
}
</style>
</head>

<body>

<div id="map"></div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>

const indiaBounds = [
  [6.0, 68.0],
  [38.0, 98.0]
];

const map = L.map('map', {
  zoomControl: true,
  minZoom: 4,
  maxZoom: 20,
  maxBounds: indiaBounds,
  maxBoundsViscosity: 1.0
});

map.setView([22.5937, 78.9629], 5);

// Strictly restrict map to India only
map.invalidateSize();
map.setMaxBounds(indiaBounds);
map.setView([22.5937, 78.9629], 5, { animate: false });

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© gravity web technologies',
    maxZoom: 19
  }
).addTo(map);

// Hide any tiles outside India by letting maxBounds handle it
// (Leaflet will not render panning outside these bounds)
map.setMaxBounds(indiaBounds);

const locations = ${JSON.stringify(locations)};

const bounds = [];

locations.forEach((item) => {

  const lat = parseFloat(item.LatitudeApp);
  const lng = parseFloat(item.LongitudeApp);

  if (!isNaN(lat) && !isNaN(lng)) {

    const marker = L.marker([lat, lng]).addTo(map);

    marker.bindPopup(\`
      <div class="info">
        <b>\${item.BranchName || ''}</b><br/>
        <b>Owner:</b> \${item.OwnerName || ''}<br/>
       
      </div>
    \`);

    bounds.push([lat, lng]);
  }
});

if (bounds.length > 0) {
  map.fitBounds(bounds, {
    padding: [50, 50],
    maxZoom: 8
  });
}

L.control.scale({
  metric: true,
  imperial: false
}).addTo(map);

</script>

</body>
</html>
`;

      setHtml(htmlContent);
    } catch (error) {
      console.log('Map Error:', error);
    }
  };

  if (!html) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ html }}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
      mixedContentMode="always"
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      startInLoadingState={true}
    />
  );
};

export default LoginMap;