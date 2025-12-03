import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  BackHandler
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Funkcija za generiranje nasumične boje
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const OfflineMapsScreen = () => {
  const [downloadedRoutes, setDownloadedRoutes] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    checkDownloadedRoutes();
    requestLocationPermission();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (selectedRoute) {
          setSelectedRoute(null);
          return true;
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'InfoMain' }],
          });
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [selectedRoute])
  );

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Dozvola potrebna',
          'Dozvola za lokaciju je potrebna kako bi se prikazala vaša pozicija na offline mapama.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Greška pri traženju dozvole za lokaciju:', error);
    }
  };

  const checkDownloadedRoutes = async () => {
    try {
      const mapDir = `${FileSystem.documentDirectory}maps/`;
      const dirInfo = await FileSystem.getInfoAsync(mapDir);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(mapDir);
        return;
      }

      const maps = await FileSystem.readDirectoryAsync(mapDir);
      const routes = await Promise.all(maps.map(async (mapName) => {
        if (mapName.endsWith('.json')) {
          const mapData = await FileSystem.readAsStringAsync(`${mapDir}${mapName}`);
          try {
            const route = JSON.parse(mapData);
            return { name: mapName.replace('.json', ''), ...route };
          } catch (error) {
            console.error(`Greška pri parsiranju JSON podataka za ${mapName}:`, error);
            return null; // Ignoriraj ovu datoteku ako nije ispravan JSON
          }
        } else {
          return null; // Ignoriraj datoteke koje nisu JSON
        }
      }));
      setDownloadedRoutes(routes.filter(route => route !== null)); // Filtriraj null vrijednosti
    } catch (error) {
      console.error('Greška pri provjeri preuzetih ruta:', error);
    }
  };

  const openRoute = async (route) => {
    setSelectedRoute(route.route);
  };

  const deleteRoute = async (routeName) => {
    try {
      const mapsDir = `${FileSystem.documentDirectory}maps/`;
      const mapPath = `${mapsDir}${routeName}.json`;

      await FileSystem.deleteAsync(mapPath, { idempotent: true });
      setDownloadedRoutes(prev => prev.filter(route => route.name !== routeName));
      Alert.alert('Uspjeh', `Ruta za ${routeName} je izbrisana`);

    } catch (error) {
      Alert.alert('Greška', 'Nije uspjelo brisanje route');
      console.error('Greška pri brisanju route:', error);
    }
  };

  const handleRouteDownloaded = (route) => {
    const color = getRandomColor();
    const routeWithColor = { ...route, color };
    setDownloadedRoutes(prev => [...prev, routeWithColor]);
    setSelectedRoute(routeWithColor.route);
    navigation.navigate('OfflineMapsScreen'); // Vraćanje na ekran sa preuzetim rutama
  };

  const handleBackPress = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'InfoMain' }],
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress} style={{ paddingLeft: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderRouteItem = ({ item }) => (
    <View style={styles.mapItem}>
      <View style={styles.mapInfo}>
        <Text style={styles.mapName}>{item.startLocation} - {item.endLocation}</Text>
        <Text style={styles.mapDetails}>
          Udaljenost: {(item.route.distance / 1000).toFixed(2)} km
        </Text>
      </View>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => openRoute(item)}
      >
        <MaterialIcons name="folder-open" size={24} color="blue" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Brisanje rute',
            `Jeste li sigurni da želite izbrisati rutu ${item.startLocation} - ${item.endLocation}?`,
            [
              { text: 'Odustani', style: 'cancel' },
              { text: 'Izbriši', onPress: () => deleteRoute(item.name), style: 'destructive' }
            ]
          );
        }}
      >
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {!selectedRoute && (
        <>
          
          
          <TouchableOpacity
            style={styles.routeButton}
            onPress={() => navigation.navigate('RouteMapScreen')}
          >
            <Text style={styles.routeButtonText}>Preuzmi mapu</Text>
          </TouchableOpacity>

          <View style={styles.mapsList}>
            <Text style={styles.sectionTitle}>Preuzete rute</Text>
            {downloadedRoutes.length === 0 ? (
              <Text style={styles.noMapsText}>
                Još uvijek nema preuzetih offline ruta
              </Text>
            ) : (
              <FlatList
                data={downloadedRoutes}
                renderItem={renderRouteItem}
                keyExtractor={item => item.name}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </>
      )}

      {location && selectedRoute && (
        <View style={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.fullScreenMap}
            initialRegion={{
              latitude: selectedRoute.path[0].latitude,
              longitude: selectedRoute.path[0].longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Polyline coordinates={selectedRoute.path} strokeColor={selectedRoute.color} strokeWidth={4} />
          </MapView>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedRoute(null)}
          >
            <Text style={styles.backButtonText}>Nazad</Text>
          </TouchableOpacity>
        </View>
      )}
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
  routeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  routeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  noMapsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  mapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  mapInfo: {
    flex: 1,
  },
  mapName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mapDetails: {
    color: '#666',
    marginTop: 4,
  },
  openButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OfflineMapsScreen;