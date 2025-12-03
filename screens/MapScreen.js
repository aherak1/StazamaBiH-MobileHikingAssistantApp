import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { routesData } from './routesData';

const MapScreen = ({ navigation, route }) => {
  const [mapHtml, setMapHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);

  // Load specific route based on navigation params
  useEffect(() => {
    if (route.params?.location && route.params?.routeId) {
      loadSpecificRoute(route.params.location, route.params.routeId);
    }
  }, [route.params]);

  const loadSpecificRoute = async (location, routeId) => {
    setIsLoading(true);
    try {
      // Find the specific route from our data
      const locationRoutes = routesData[location] || [];
      const selectedRoute = locationRoutes.find(r => r.id === routeId);
      
      if (selectedRoute) {
        setCurrentRoute(selectedRoute);
        await fetchAndGenerateMapHtml([selectedRoute]);
      } else {
        setMapHtml('');
      }
    } catch (error) {
      console.error('Error loading route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndGenerateMapHtml = async (routesData) => {
    try {
      // For each route, fetch the actual path
      const routesWithPaths = await Promise.all(
        routesData.map(async (route, index) => {
          // Determine route profile based on route type
          let routeProfile = 'foot'; // Default to foot
          if (route.tip.toLowerCase().includes('bicikl')) {
            routeProfile = 'bike';
          } else if (!route.tip.toLowerCase().includes('pješačk')) {
            routeProfile = 'car';
          }
          
          // Prepare data for the route
          const start = route.koordinate.start;
          const end = route.koordinate.end;
          
          try {
            // Use OSRM API to get the actual path
            const path = await fetchRoutePath(
              start.longitude, start.latitude,
              end.longitude, end.latitude,
              routeProfile
            );
            
            return {
              ...route,
              path: path,
              color: getRouteColor(index),
              isHighlighted: true, // Always highlight since it's the only route
              distance: route.udaljenost,
              duration: route.trajanje,
              routeType: routeProfile
            };
          } catch (error) {
            console.error(`Error fetching path for route ${route.naziv}:`, error);
            // Return route without path if we can't fetch the actual one
            return {
              ...route,
              path: null,
              color: getRouteColor(index),
              isHighlighted: true,
              distance: route.udaljenost,
              duration: route.trajanje,
              routeType: routeProfile
            };
          }
        })
      );

      generateMapHtml(routesWithPaths);
    } catch (error) {
      console.error('Error fetching paths:', error);
    }
  };

  const fetchRoutePath = async (startLon, startLat, endLon, endLat, profile = 'foot') => {
    try {
      // Convert profile to OSRM compatible format
      const osrmProfile = profile === 'bike' ? 'cycling' : profile === 'foot' ? 'walking' : 'driving';
      
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=polyline`
      );
      
      if (!response.ok) {
        throw new Error('Problem with fetching the path');
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry;
      } else {
        throw new Error('No available paths');
      }
    } catch (error) {
      console.error('Error fetching route path:', error);
      throw error;
    }
  };

  const generateMapHtml = (routesWithPaths) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script src="https://unpkg.com/polyline-encoded@0.0.9/Polyline.encoded.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .route-info {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            font-weight: bold;
            font-size: 20px;
            text-align: center;
            min-width: 200px;
          }
          .route-type {
            display: inline-block;
            margin-top: 4px;
            font-size: 18px;
            color: #666;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 10px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        ${routesWithPaths.length > 0 ? 
          `<div class="route-info">
             ${routesWithPaths[0].naziv}
             <div class="route-type">${routesWithPaths[0].tip}</div>
           </div>` 
         : ''}
        
        <script>
          const map = L.map('map');
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          const routes = ${JSON.stringify(routesWithPaths)};
          const layers = [];
          const markers = [];
          
          // Icons for start and end of route
          const startIcon = L.divIcon({
            html: '<div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            className: '',
            iconSize: [16, 16]
          });
          
          const endIcon = L.divIcon({
            html: '<div style="background-color: #F44336; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            className: '',
            iconSize: [16, 16]
          });
          
          routes.forEach((route, index) => {
            try {
              let routeLayer;
              let routeWeight = 6; // Make line thicker since it's the only route
              let routeOpacity = 1; 
              
              if (route.path) {
                // If we have a path, use polyline from encoded polyline
                const decodedCoords = L.Polyline.fromEncoded(route.path).getLatLngs();
                
                routeLayer = L.polyline(decodedCoords, { 
                  color: route.color, 
                  weight: routeWeight, 
                  opacity: routeOpacity,
                  lineCap: 'round',
                  lineJoin: 'round'
                }).addTo(map);
              } else {
                // If we don't have a path, use direct line
                const start = [route.koordinate.start.latitude, route.koordinate.start.longitude];
                const end = [route.koordinate.end.latitude, route.koordinate.end.longitude];
                
                routeLayer = L.polyline([start, end], { 
                  color: route.color, 
                  weight: routeWeight, 
                  opacity: routeOpacity,
                  dashArray: '5, 10', // Dashed line for direct routes
                }).addTo(map);
              }
              
              // Add markers for start and end with detailed popups
              const start = [route.koordinate.start.latitude, route.koordinate.start.longitude];
              const end = [route.koordinate.end.latitude, route.koordinate.end.longitude];
              
              const startMarker = L.marker(start, {icon: startIcon}).addTo(map)
                .bindPopup('<strong>' + route.naziv + '</strong><br>Početna točka<br>Tip: ' + route.tip);
              
              const endMarker = L.marker(end, {icon: endIcon}).addTo(map)
                .bindPopup('<strong>' + route.naziv + '</strong><br>Krajnja točka<br>Tip: ' + route.tip);
              
              markers.push(startMarker, endMarker);
              layers.push(routeLayer);
            } catch (error) {
              console.error('Error adding route to map:', error);
            }
          });
          
          // Set view to encompass the route
          if (layers.length > 0) {
            const group = new L.featureGroup([...layers, ...markers]);
            map.fitBounds(group.getBounds(), { padding: [30, 30] });
          }
        </script>
      </body>
      </html>
    `;
    setMapHtml(html);
  };

  const getRouteColor = () => {
    // Using a single standard color since we're only showing one route
    return '#3388FF';
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2a77b3" />
          <Text style={styles.loadingText}>Učitavanje rute...</Text>
        </View>
      ) : mapHtml ? (
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Nije odabrana nijedna ruta za prikaz
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#495057',
    fontSize: 16,
  },
});

export default MapScreen;