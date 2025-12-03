import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  Animated,
  useColorScheme,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/bs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Funkcija za kapitalizaciju prvog slova
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const RouteListScreen = ({ navigation, route }) => {
  const { mountainName, routes, coordinates } = route.params;
  const [filteredRoutes, setFilteredRoutes] = useState(routes || []);
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [sortKey, setSortKey] = useState('sve');
  const [refreshing, setRefreshing] = useState(false);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();

  const API_KEY = '06d29314c289499cb95741267baa4945';

  const weatherIcons = {
    'Clear Sky': 'weather-sunny',
    'Few clouds': 'weather-partly-cloudy',
    'Scattered clouds': 'weather-cloudy',
    'Broken clouds': 'weather-cloudy',
    'Shower rain': 'weather-rainy',
    'Moderate rain': 'weather-pouring',
    'Light shower rain': 'weather-rainy',
    'Light rain': 'weather-rainy',
    'Thunderstorm': 'weather-lightning',
    'Snow': 'weather-snowy',
    'Heavy snow': 'weather-snowy-heavy',
    'Mist': 'weather-fog',
    'Haze': 'weather-fog',
    'Fog': 'weather-fog',
    'Overcast clouds': 'weather-cloudy',
    'Heavy rain': 'weather-pouring',
    'Mix snow/rain': 'weather-snowy-rainy',
    'Light snow': 'weather-snowy',
  };

  const weatherDescriptions = {
    'Clear Sky': 'Sunčano',
    'Few clouds': 'Sunčano sa naoblakom',
    'Scattered clouds': 'Sunčano sa naoblakom',
    'Broken clouds': 'Djelimično oblačno',
    'Shower rain': 'Pljuskovi',
    'Moderate rain': 'Jaka kiša',
    'Light shower rain': 'Pljuskovi',
    'Light rain': 'Pljuskovi',
    'Thunderstorm': 'Grmljavina',
    'Snow': 'Snijeg',
    'Heavy snow': 'Jaki snijeg',
    'Mist': 'Magla',
    'Haze': 'Izmaglica',
    'Fog': 'Magla',
    'Overcast clouds': 'Oblačno',
    'Heavy rain': 'Jaka kiša',
    'Mix snow/rain': 'Snijeg sa kišom',
    'Light snow': 'Slab snijeg',
  };

  useEffect(() => {
    loadWeather();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadWeather = async () => {
    try {
      const cachedWeather = await AsyncStorage.getItem(`weather_${coordinates.lat}_${coordinates.lon}`);
      if (cachedWeather) {
        const { data, timestamp } = JSON.parse(cachedWeather);
        const oneHourAgo = moment().subtract(1, 'hour');

        if (moment(timestamp).isAfter(oneHourAgo)) {
          setWeather(data);
          setLoadingWeather(false);
          return;
        }
      }

      const response = await axios.get(
        `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lon}&key=${API_KEY}&days=7`
      );
      const weatherData = response.data;
      setWeather(weatherData);
      await AsyncStorage.setItem(
        `weather_${coordinates.lat}_${coordinates.lon}`,
        JSON.stringify({ data: weatherData, timestamp: new Date() })
      );
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće dohvatiti vremenske podatke. Pokušajte kasnije.');
      console.error('Error fetching weather data', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather().then(() => setRefreshing(false));
  };

  const renderWeatherIcon = (description) => {
    const iconName = weatherIcons[description] || 'weather-sunny';
    return <Icon name={iconName} size={40} color="#fff" />;
  };

  const renderWeatherItem = ({ item }) => {
    return (
      <View style={styles.weatherItem}>
        <Text style={styles.weatherDay}>
          {capitalizeFirstLetter(moment(item.datetime).locale('bs').format('dddd'))}
        </Text>
        {renderWeatherIcon(item.weather.description)}
        <Text style={styles.weatherDescription}>
          {weatherDescriptions[item.weather.description] || item.weather.description}
        </Text>
        <View style={styles.weatherDetailsContainer}>
          <Icon name="weather-windy" size={20} color="#fff" />
          <Text style={styles.weatherDetails}>Vjetar: {item.wind_spd} m/s</Text>
        </View>
        <View style={styles.weatherDetailsContainer}>
          <Icon name="water" size={20} color="#fff" />
          <Text style={styles.weatherDetails}>Vlaga: {item.rh}%</Text>
        </View>
        <Text style={styles.weatherTemp}>Max: {item.max_temp}°C</Text>
      </View>
    );
  };

   const renderRouteItem = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity onPress={() => navigation.navigate('RouteDetailScreen', { mountainName, ruta: item })}>
        <View style={styles.routeCard}>
          <View style={styles.imageContainer}>
            <Image 
              source={item.slike[0]} 
              style={styles.routeImage} 
            />
            {item.slike.length > 1 && (
              <View style={styles.imageCounter}>
                <Icon name="image-multiple" size={20} color="white" />
                <Text style={styles.counterText}>{item.slike.length}</Text>
              </View>
            )}
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName} numberOfLines={2} ellipsizeMode="tail">
              {item.naziv}
            </Text>
            <View style={styles.routeDetails}>
              <View style={styles.detailItem}>
                <Icon name="terrain" size={20} color={colorScheme === 'dark' ? '#fff' : '#666'} />
                <Text style={[styles.detailText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Tip: {item.tip}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="weight" size={20} color={colorScheme === 'dark' ? '#fff' : '#666'} />
                <Text style={[styles.detailText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Težina: {item.tezina}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="clock" size={20} color={colorScheme === 'dark' ? '#fff' : '#666'} />
                <Text style={[styles.detailText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Trajanje: {item.trajanje}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="map-marker-distance" size={20} color={colorScheme === 'dark' ? '#fff' : '#666'} />
                <Text style={[styles.detailText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Udaljenost: {item.udaljenost}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="trending-up" size={20} color={colorScheme === 'dark' ? '#fff' : '#666'} />
                <Text style={[styles.detailText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Uspon: {item.uspon}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const filterRoutesByType = (type) => {
    setSelectedType(type);
    if (type) {
      setFilteredRoutes(routes.filter((ruta) => ruta.tip === type));
    } else {
      setFilteredRoutes(routes);
    }
    setIsTypeModalVisible(false); // Zatvori modal nakon odabira
  };

  const sortRoutes = (key) => {
    setSortKey(key);
    let sortedRoutes = [...filteredRoutes];
    if (key === 'tezina') {
      sortedRoutes.sort((a, b) => a.tezina.localeCompare(b.tezina));
    } else if (key === 'trajanje') {
      sortedRoutes.sort((a, b) => a.trajanje.localeCompare(b.trajanje));
    } else {
      sortedRoutes = routes;
    }
    setFilteredRoutes(sortedRoutes);
  };

  const resetFilters = () => {
    setSelectedType(null);
    setFilteredRoutes(routes);
    setSortKey('sve');
    setIsTypeModalVisible(false); // Zatvori modal nakon resetovanja
  };

  const filteredAndSortedRoutes = filteredRoutes
    .filter((ruta) =>
      ruta.naziv.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff' }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{mountainName}</Text>
          <Text style={styles.date}>{moment().locale('bs').format('dddd, LL')}</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Pretraži staze..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colorScheme === 'dark' ? '#666' : '#ccc'}
            />
          </View>
          <View style={styles.sortButtons}>
            <TouchableOpacity onPress={() => setIsTypeModalVisible(true)}>
              <Text style={!selectedType ? styles.activeSortButton : styles.sortButton}>
                <Icon name="terrain" size={16} color={!selectedType ? '#fff' : '#007AFF'} /> Sve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => sortRoutes('tezina')}>
              <Text style={sortKey === 'tezina' ? styles.activeSortButton : styles.sortButton}>
                <Icon name="weight" size={16} color={sortKey === 'tezina' ? '#fff' : '#007AFF'} /> Težina
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => sortRoutes('trajanje')}>
              <Text style={sortKey === 'trajanje' ? styles.activeSortButton : styles.sortButton}>
                <Icon name="clock" size={16} color={sortKey === 'trajanje' ? '#fff' : '#007AFF'} /> Trajanje
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingWeather ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : weather ? (
          <View style={styles.weatherContainer}>
            <Text style={styles.weatherTitle}>Vremenska prognoza za {mountainName}</Text>
            <FlatList
              horizontal
              data={weather.data}
              renderItem={renderWeatherItem}
              keyExtractor={(item) => item.datetime}
              contentContainerStyle={styles.weatherScrollView}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ) : (
          <Text style={styles.weatherError}>Nije moguće dohvatiti vremenske podatke.</Text>
        )}

        {filteredAndSortedRoutes.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>Ne postoji takva staza</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAndSortedRoutes}
            renderItem={renderRouteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.routeList}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Modal za odabir tipa staze */}
      <Modal
        visible={isTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Odaberite tip staze</Text>
            <TouchableOpacity onPress={() => filterRoutesByType('Pješačke staze')}>
              <View style={styles.modalOption}>
                <Icon name="hiking" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>Pješačke staze</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => filterRoutesByType('Snježne staze')}>
              <View style={styles.modalOption}>
                <Icon name="snowflake" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>Snježne staze</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => filterRoutesByType('Biciklističke staze')}>
              <View style={styles.modalOption}>
                <Icon name="bike" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>Biciklističke staze</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetFilters()}>
              <View style={styles.modalOption}>
                <Icon name="refresh" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>Reset</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  weatherContainer: {
    padding: 16,
    backgroundColor: '#2193b0',
    width: '90%',
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  weatherScrollView: {
    paddingBottom: 20,
  },
  weatherItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weatherDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  weatherDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    color: '#fff',
  },
  weatherDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  weatherDetails: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 5,
  },
  weatherError: {
    padding: 16,
    color: 'red',
    textAlign: 'center',
  },
  routeList: {
    padding: 16,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  routeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  routeInfo: {
    padding: 20,
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    flexShrink: 1,
  },
  routeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    width: '48%',
  },
  detailText: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  sortButton: {
    fontSize: 16,
    color: '#007AFF',
    padding: 8,
    borderRadius: 5,
  },
  activeSortButton: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    paddingVertical: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  routeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    gap: 4,
  },
  counterText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RouteListScreen;