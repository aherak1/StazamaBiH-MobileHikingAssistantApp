import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ActivityIndicator, 
  FlatList, 
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';

const RADIUS = 2000; // 2 km u metrima
const OSM_CATEGORIES = {
  restaurant: ['amenity=restaurant', 'amenity=fast_food'],
  hotel: ['tourism=hotel', 'tourism=hostel', 'tourism=guest_house'],
  cafe: ['amenity=cafe', 'amenity=bar']
};

const CATEGORY_NAMES = {
  restaurant: 'Restorani',
  hotel: 'Hoteli',
  cafe: 'Kafići i barovi'
};

const TYPE_TRANSLATIONS = {
  'restaurant': 'Restoran',
  'cafe': 'Kafić',
  'fast_food': 'Brza hrana',
  'hotel': 'Hotel',
  'hostel': 'Hostel',
  'guest_house': 'Pansion',
  'bar': 'Bar'
};

const PlacesScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState('restaurant');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [mapHtml, setMapHtml] = useState('');
  const webViewRef = useRef(null);
  const flatListRef = useRef(null);

  // Funkcija za slanje komandi WebView-u
  const sendCommandToMap = (command) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        try {
          focusOnPlace("${command.placeId}");
          true;
        } catch(e) {
          false;
        }
      `);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Dozvola za lokaciju nije odobrena');
        setShowPermissionModal(true);
        return false;
      }
      return true;
    } catch (error) {
      setErrorMsg('Greška pri traženju dozvole: ' + error.message);
      return false;
    }
  };

  const getLocation = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setErrorMsg(null);
      fetchPlaces(currentLocation, activeCategory);
    } catch (error) {
      setErrorMsg('Greška pri dohvatanju lokacije: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaces = async (location, category) => {
    try {
      const queryParts = OSM_CATEGORIES[category];
      const overpassQuery = `
        [out:json];
        (
          ${queryParts.map(tag => `node[${tag}](around:${RADIUS},${location.coords.latitude},${location.coords.longitude});
          way[${tag}](around:${RADIUS},${location.coords.latitude},${location.coords.longitude});
          relation[${tag}](around:${RADIUS},${location.coords.latitude},${location.coords.longitude});`).join('\n')}
        );
        out center;
      `;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
      );
      
      if (!response.ok) throw new Error('Problem sa Overpass API');

      const data = await response.json();
      const processedPlaces = data.elements.map(element => ({
        id: element.id.toString(), // Osiguravamo da je ID string
        name: element.tags?.name || 'Nepoznati lokal',
        type: element.tags?.amenity || element.tags?.tourism || 'restaurant',
        coordinates: {
          latitude: element.lat || element.center?.lat,
          longitude: element.lon || element.center?.lon
        },
        tags: element.tags
      }));

      setPlaces(processedPlaces);
      generateMapHtml(location, processedPlaces);
    } catch (error) {
      setErrorMsg('Greška pri dohvaćanju lokala: ' + error.message);
    }
  };

  const generateMapHtml = (userLocation, placesData) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .custom-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            color: white;
            font-size: 12px;
          }
          .selected-marker {
            filter: drop-shadow(0 0 10px rgba(0, 123, 255, 0.8));
            transform: scale(1.3);
            transition: all 0.3s ease;
            z-index: 1000;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let markers = [];
          let selectedMarker = null;
          let userLocation = [${userLocation.coords.latitude}, ${userLocation.coords.longitude}];
          let places = ${JSON.stringify(placesData)};
          
          function initMap() {
            map = L.map('map').setView(userLocation, 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Add user location marker
            const userIcon = L.divIcon({
              html: '<div style="background-color: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; justify-content: center; align-items: center;"><i class="fas fa-user" style="color: white; font-size: 10px;"></i></div>',
              className: '',
              iconSize: [24, 24]
            });
            
            L.marker(userLocation, {
              icon: userIcon
            }).addTo(map)
              .bindPopup('<b>Vaša lokacija</b>');
            
            // Add places markers
            places.forEach(place => {
              let iconClass, iconColor;
              
              if (place.type === 'hotel' || place.type === 'hostel' || place.type === 'guest_house') {
                iconClass = 'fas fa-hotel';
                iconColor = '#4CAF50';
              } else if (place.type === 'cafe') {
                iconClass = 'fas fa-coffee';
                iconColor = '#FF9800';
              } else if (place.type === 'bar') {
                iconClass = 'fas fa-glass-martini-alt';
                iconColor = '#9C27B0';
              } else {
                iconClass = 'fas fa-utensils';
                iconColor = '#FF5252';
              }
              
              const placeIcon = L.divIcon({
                html: \`<div class="custom-icon" style="background-color: \${iconColor}"><i class="\${iconClass}"></i></div>\`,
                className: '',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              });
              
              const marker = L.marker([place.coordinates.latitude, place.coordinates.longitude], {
                icon: placeIcon,
                placeId: place.id
              }).addTo(map)
                .bindPopup(\`<b>\${place.name}</b><br>\${translateType(place.type)}\`);
              
              markers.push(marker);
            });
          }
          
          function translateType(type) {
            const translations = ${JSON.stringify(TYPE_TRANSLATIONS)};
            return translations[type] || type;
          }
          
          // Ova funkcija se poziva iz React Native-a
          function focusOnPlace(placeId) {
            // Reset previous selection
            if (selectedMarker) {
              selectedMarker._icon.classList.remove('selected-marker');
            }
            
            // Find and highlight new marker
            const marker = markers.find(m => m.options.placeId === placeId);
            if (marker) {
              map.setView(marker.getLatLng(), 18);
              marker._icon.classList.add('selected-marker');
              marker.openPopup();
              selectedMarker = marker;
              return true;
            }
            return false;
          }
          
          // Initialize map when page loads
          document.addEventListener('DOMContentLoaded', initMap);
        </script>
      </body>
      </html>
    `;
    setMapHtml(html);
  };

  const handlePlaceSelect = (place, index) => {
    console.log('Selected place:', place.id); // Debug log
    setSelectedPlace(place);
    
    // Scroll to place in FlatList
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5
      });
    }
    
    // Send command to map to focus on place
    sendCommandToMap({
      type: 'FOCUS_PLACE',
      placeId: place.id
    });
  };

  const translateType = (type) => {
    return TYPE_TRANSLATIONS[type] || type;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchPlaces(location, activeCategory);
      setSelectedPlace(null);
    }
  }, [activeCategory]);

  const renderPlaceItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.placeCard, 
        selectedPlace?.id === item.id && styles.selectedPlaceCard
      ]}
      onPress={() => handlePlaceSelect(item, index)}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.placeType}>{translateType(item.type)}</Text>
        {location && (
          <View style={styles.distanceContainer}>
            <MaterialIcons name="location-on" size={14} color="#666" />
            <Text style={styles.distanceText}>
              {calculateDistance(
                location.coords.latitude, 
                location.coords.longitude,
                item.coordinates.latitude,
                item.coordinates.longitude
              )} km
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const PermissionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPermissionModal}
      onRequestClose={() => setShowPermissionModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <MaterialIcons name="location-on" size={50} color="#007AFF" />
          <Text style={styles.modalTitle}>Pristup lokaciji</Text>
          <Text style={styles.modalText}>
            Aplikacija treba pristup vašoj lokaciji da bi prikazala objekte u blizini.
          </Text>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowPermissionModal(false);
              getLocation();
            }}
          >
            <Text style={styles.modalButtonText}>Dozvoli pristup lokaciji</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowPermissionModal(false)}
          >
            <Text style={styles.modalCancelText}>Zatvori</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Učitavanje lokacije...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={getLocation}
        >
          <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PermissionModal />
      
      {location && (
        <>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={(event) => {
              console.log('Message from WebView:', event.nativeEvent.data);
            }}
            onLoadEnd={() => {
              console.log('WebView loaded successfully');
            }}
          />

          {/* Filter kategorija */}
          <View style={styles.categoriesContainer}>
            {Object.keys(OSM_CATEGORIES).map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  activeCategory === category && styles.activeCategoryButton
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  activeCategory === category && styles.activeCategoryButtonText
                ]}>
                  {CATEGORY_NAMES[category]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lista lokala */}
          <View style={styles.placesContainer}>
            <Text style={styles.placesTitle}>
              {CATEGORY_NAMES[activeCategory]} u blizini ({places.length})
            </Text>
            <FlatList
              ref={flatListRef}
              data={places}
              renderItem={renderPlaceItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.placesList}
              getItemLayout={(data, index) => ({
                length: 170,
                offset: 170 * index,
                index
              })}
            />
          </View>
        </>
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
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  categoriesContainer: {
    position: 'absolute',
    top: 20,
    left: 34,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
  },
  activeCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 15,
  },
  activeCategoryButtonText: {
    color: 'white',
  },
  placesContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    color: '#212529',
  },
  placesList: {
    paddingHorizontal: 15,
  },
  placeCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    padding: 15,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedPlaceCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#e7f1ff',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#212529',
  },
  placeType: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#343a40',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6c757d',
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 15,
    padding: 10,
  },
  modalCancelText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PlacesScreen;