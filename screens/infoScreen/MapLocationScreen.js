import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Text, 
  Dimensions,
  TouchableOpacity,
  Modal
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

const MapLocationScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [mapType, setMapType] = useState('standard');
  const [showMapTypeModal, setShowMapTypeModal] = useState(false);
  const [locationName, setLocationName] = useState('');

  const requestLocationPermission = async (permissionType) => {
    try {
      let response;
      
      switch(permissionType) {
        case 'always':
          response = await Location.requestBackgroundPermissionsAsync();
          break;
        case 'whileInUse':
          response = await Location.requestForegroundPermissionsAsync();
          break;
        case 'oneTime':
          response = await Location.requestForegroundPermissionsAsync();
          break;
        default:
          response = { status: 'denied' };
      }

      if (response.status === 'granted') {
        setShowPermissionModal(false);
        getLocation();
      } else {
        Alert.alert(
          'Lokacija nije dostupna',
          'Potreban je pristup vašoj lokaciji za korištenje ove funkcije.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setErrorMsg('Greška pri traženju dozvole: ' + error.message);
    }
  };

  const getLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setErrorMsg(null);
      getLocationName(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      setErrorMsg('Greška pri dohvatanju lokacije: ' + error.message);
      Alert.alert(
        'Greška',
        'Nije moguće dohvatiti vašu lokaciju. Provjerite da li je GPS uključen.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = async (latitude, longitude) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        setLocationName(`${address.street}, ${address.city}, ${address.region}, ${address.country}`);
      } else {
        setLocationName('Naziv lokacije nije dostupan');
      }
    } catch (error) {
      setLocationName('Greška pri dohvatanju naziva lokacije: ' + error.message);
    }
  };

  const refreshLocation = () => {
    setShowPermissionModal(true);
  };

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
            Kako želite dozvoliti pristup vašoj lokaciji?
          </Text>
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => requestLocationPermission('always')}
          >
            <Text style={styles.modalButtonText}>Uvijek dozvoli</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, { marginTop: 10 }]}
            onPress={() => requestLocationPermission('whileInUse')}
          >
            <Text style={styles.modalButtonText}>Samo dok koristim aplikaciju</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, { marginTop: 10 }]}
            onPress={() => requestLocationPermission('oneTime')}
          >
            <Text style={styles.modalButtonText}>Samo ovaj put</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowPermissionModal(false)}
          >
            <Text style={styles.modalCancelText}>Ne dozvoli</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const MapTypeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showMapTypeModal}
      onRequestClose={() => setShowMapTypeModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tip mape</Text>
          
          <TouchableOpacity
            style={[
              styles.modalButton,
              mapType === 'standard' && styles.selectedButton
            ]}
            onPress={() => {
              setMapType('standard');
              setShowMapTypeModal(false);
            }}
          >
            <Text style={styles.modalButtonText}>Standardna</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalButton,
              { marginTop: 10 },
              mapType === 'satellite' && styles.selectedButton
            ]}
            onPress={() => {
              setMapType('satellite');
              setShowMapTypeModal(false);
            }}
          >
            <Text style={styles.modalButtonText}>Satelit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalButton,
              { marginTop: 10 },
              mapType === 'terrain' && styles.selectedButton
            ]}
            onPress={() => {
              setMapType('terrain');
              setShowMapTypeModal(false);
            }}
          >
            <Text style={styles.modalButtonText}>Teren</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modalButton,
              { marginTop: 10 },
              mapType === 'hybrid' && styles.selectedButton
            ]}
            onPress={() => {
              setMapType('hybrid');
              setShowMapTypeModal(false);
            }}
          >
            <Text style={styles.modalButtonText}>Hibrid</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowMapTypeModal(false)}
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

  return (
    <View style={styles.container}>
      <PermissionModal />
      <MapTypeModal />
      
      {location ? (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            mapType={mapType}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Vaša lokacija"
              description={`${location.coords.latitude}, ${location.coords.longitude}`}
            />
          </MapView>

          <TouchableOpacity 
            style={styles.mapTypeButton}
            onPress={() => setShowMapTypeModal(true)}
          >
            <MaterialIcons name="layers" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <Text style={styles.infoPanelLabel}>Geografska širina: </Text>
              <Text style={styles.infoPanelText}>{location.coords.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoPanelLabel}>Geografska dužina: </Text>
              <Text style={styles.infoPanelText}>{location.coords.longitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoPanelLabel}>Preciznost: </Text>
              <Text style={styles.infoPanelText}>{Math.round(location.coords.accuracy)}m</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoPanelLabel}>Lokacija: </Text>
              <Text style={[styles.infoPanelText, styles.flexShrink]}>{locationName}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.centerContainer}>
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <Text style={styles.infoText}>Lokacija nije dostupna</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    flexWrap: 'nowrap',
  },
  infoPanelLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  infoPanelText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  mapTypeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
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
    marginTop: 10,
    padding: 10,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: '#004999',
  },
});

export default MapLocationScreen;