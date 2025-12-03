import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

const OSRM_URL = 'http://router.project-osrm.org/route/v1';

// Funkcija za generiranje nasumične boje
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const RouteMapScreen = () => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const mapRef = useRef(null);
  const navigation = useNavigation();

  const getCoordinates = async (location) => {
    try {
      const geocode = await Location.geocodeAsync(location);
      if (!geocode || geocode.length === 0) {
        Alert.alert('Greška', 'Lokacija nije pronađena');
        return null;
      }
      return {
        latitude: geocode[0].latitude,
        longitude: geocode[0].longitude,
      };
    } catch (error) {
      Alert.alert('Greška', 'Nešto je pošlo po zlu pri traženju lokacije');
      console.error('Greška pri traženju lokacije:', error);
      return null;
    }
  };

  const fetchRoutesFromAPI = async (startCoords, endCoords) => {
    const url = `${OSRM_URL}/car/${startCoords.longitude},${startCoords.latitude};${endCoords.longitude},${endCoords.latitude}?overview=full&geometries=geojson&alternatives=true`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length === 0) {
        Alert.alert('Greška', 'Nema dostupne rute za zadane lokacije');
        return [];
      }

      const routes = data.routes.map((route) => ({
        path: route.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
        distance: route.distance,
        color: getRandomColor(), // Dodajemo nasumičnu boju za svaku rutu
      }));

      return routes;
    } catch (error) {
      Alert.alert('Greška', 'Nešto je pošlo po zlu pri dobijanju ruta');
      console.error('Greška pri dobijanju ruta:', error);
      return [];
    }
  };

  const calculateRoutes = async () => {
    const startCoords = await getCoordinates(startLocation);
    const endCoords = await getCoordinates(endLocation);
    if (startCoords && endCoords) {
      const routesData = await fetchRoutesFromAPI(startCoords, endCoords);
      setRoutes(routesData);
      setSelectedRouteIndex(null);
      setActiveRoute(null);
      if (routesData.length > 0) {
        mapRef.current.animateToRegion({
          latitude: (startCoords.latitude + endCoords.latitude) / 2,
          longitude: (startCoords.longitude + endCoords.longitude) / 2,
          latitudeDelta: Math.abs(startCoords.latitude - endCoords.latitude) * 2,
          longitudeDelta: Math.abs(startCoords.longitude - endCoords.longitude) * 2,
        }, 1000);
      }
    }
  };

  const formatDistance = (distance) => {
    return (distance / 1000).toFixed(2) + ' km';
  };

  const handleRoutePress = (index) => {
    setSelectedRouteIndex(index);
    setActiveRoute(routes[index]);
    mapRef.current.animateToRegion({
      latitude: routes[index].path[0].latitude,
      longitude: routes[index].path[0].longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  const downloadMapWithRoute = async () => {
    if (selectedRouteIndex === null) {
      Alert.alert('Greška', 'Molimo odaberite rutu prije preuzimanja karte.');
      return;
    }

    try {
      const mapDir = `${FileSystem.documentDirectory}maps/`;
      const fileUri = `${mapDir}${startLocation}-${endLocation}-ruta${selectedRouteIndex + 1}.json`;

      const mapData = JSON.stringify({
        startLocation,
        endLocation,
        route: activeRoute,
      });

      // Ensure the directory exists
      const dirInfo = await FileSystem.getInfoAsync(mapDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(mapDir);
      }

      // Save the JSON data to the file
      await FileSystem.writeAsStringAsync(fileUri, mapData, { encoding: FileSystem.EncodingType.UTF8 });

      Alert.alert('Uspjeh', 'Ruta je uspješno preuzeta.');
      navigation.navigate('OfflineMape'); // Navigacija na ekran sa preuzetim rutama
    } catch (error) {
      Alert.alert('Greška', 'Nešto je pošlo po zlu pri preuzimanju rute.');
      console.error('Greška pri preuzimanju rute:', error);
    }
  };

  return (
    <View style={styles.container}>
      
      <TextInput
        style={styles.input}
        placeholder="Početna lokacija (npr. Sarajevo)"
        value={startLocation}
        onChangeText={setStartLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Krajnja lokacija (npr. Maglaj)"
        value={endLocation}
        onChangeText={setEndLocation}
      />
      <TouchableOpacity style={styles.calculateButton} onPress={calculateRoutes}>
        <Text style={styles.buttonText}>Izračunaj rutu</Text>
      </TouchableOpacity>
      {routes.length > 0 && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: routes[0].path[0].latitude,
            longitude: routes[0].path[0].longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {routes.map((route, index) => (
            <Polyline
              key={index}
              coordinates={route.path}
              strokeColor={route.color} // Koristimo boju rute
              strokeWidth={4}
              tappable
              onPress={() => handleRoutePress(index)}
            />
          ))}
          {activeRoute && (
            <Marker
              coordinate={activeRoute.path[Math.floor(activeRoute.path.length / 2)]}
              title={`Ruta ${selectedRouteIndex + 1}`}
              description={`Udaljenost: ${formatDistance(activeRoute.distance)}`}
            />
          )}
        </MapView>
      )}
      <TouchableOpacity style={styles.downloadButton} onPress={downloadMapWithRoute}>
        <Text style={styles.buttonText}>Preuzmi rutu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  calculateButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    height: Dimensions.get('window').height * 0.85,
    marginTop: 20,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default RouteMapScreen;