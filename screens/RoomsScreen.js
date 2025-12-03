import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Mock podaci za smještaj
import accommodationsData from './accommodationsData';

const RoomsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAccommodations, setFilteredAccommodations] = useState(accommodationsData);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [sortCriteria, setSortCriteria] = useState('');
  
  // State za filtere
  const [accommodationType, setAccommodationType] = useState('sve'); // Promjena: 'all' -> 'sve'
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  
  // Predefinisane opcije
  const accommodationTypes = ['Sve', 'Hotel', 'Apartman', 'Kuća'];
  const amenities = ['Wi-Fi', 'Parking', 'Bazen', 'Restoran', 'Teretana'];

  const handleSearch = (query) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    applyFilters(trimmedQuery);
  };

  const handleSort = (criteria) => {
    setSortCriteria(criteria);
    setIsSortModalVisible(false);

    let sortedAccommodations = [...filteredAccommodations];

    // Ako je kriterij prazan, vrati na originalni redoslijed
    if (!criteria) {
      setFilteredAccommodations(accommodationsData);
      return;
    }

    // Inače, sortiraj prema odabranom kriteriju
    switch (criteria) {
      case 'rating':
        sortedAccommodations.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        sortedAccommodations.sort((a, b) => a.price - b.price);
        break;
      case 'availability':
        sortedAccommodations = [
          ...sortedAccommodations.filter(a => a.available),
          ...sortedAccommodations.filter(a => !a.available)
        ];
        break;
      default:
        break;
    }

    setFilteredAccommodations(sortedAccommodations);
  };

  const handleSortReset = () => {
    setSortCriteria(''); // Resetuj kriterij sortiranja
    setSearchQuery(''); // Resetuj pretragu (novo!)
    setFilteredAccommodations(accommodationsData); // Vrati na originalni redoslijed
    setIsSortModalVisible(false); // Zatvori modalni prozor
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const applyFilters = (searchText = searchQuery) => {
    let filtered = [...accommodationsData];

    // Pretraga po tekstu (samo ako postoji upit)
    if (searchText.trim()) {
      filtered = filtered.filter((accommodation) => 
        accommodation.location.toLowerCase().includes(searchText.toLowerCase()) ||
        accommodation.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Tip smještaja - ISPRAVKA: Provjeri da li je 'sve' ili neki specifični tip
    if (accommodationType !== 'sve') {
      filtered = filtered.filter(item => item.type.toLowerCase() === accommodationType.toLowerCase());
    }
    // Ako je 'sve', ne filtriramo po tipu - ostavljamo sve

    // Cjenovni raspon
    filtered = filtered.filter(item => 
      item.price >= minPrice && item.price <= maxPrice
    );

    // Dodatne usluge
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(item => 
        selectedAmenities.every(amenity => 
          item.amenities && item.amenities.includes(amenity)
        )
      );
    }

    setFilteredAccommodations(filtered);
    setIsFilterModalVisible(false);
  };

  const handleReset = () => {
    setAccommodationType('sve'); // Promjena: 'all' -> 'sve'
    setMinPrice(0); // Resetuj minimalnu cijenu
    setMaxPrice(1000); // Resetuj maksimalnu cijenu
    setSelectedAmenities([]); // Resetuj dodatne usluge
    setSearchQuery(''); // Resetuj pretragu
    setFilteredAccommodations(accommodationsData); // Vrati sve smještaje
    setIsFilterModalVisible(false); // Zatvori modalni prozor
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ukucaj lokaciju za pretragu smještaja..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Filter & Sort Buttons */}
      <View style={styles.filterSortContainer}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setIsFilterModalVisible(true)}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="filter" size={20} color="#fff" />
            <Text style={styles.filterButtonText}> Filtriraj</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={() => setIsSortModalVisible(true)}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="swap-vertical" size={20} color="#fff" />
            <Text style={styles.sortButtonText}> Sortiraj</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={isSortModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortModal}>
            <Text style={styles.modalTitle}>Sortiraj prema:</Text>
            <Picker
              selectedValue={sortCriteria}
              onValueChange={handleSort}
              style={styles.picker}
            >
              <Picker.Item label="Izaberi" value="" />
              <Picker.Item label="Najviše ocijenjeni" value="rating" />
              <Picker.Item label="Cijena (od najniže)" value="price" />
              <Picker.Item label="Dostupnost" value="availability" />
            </Picker>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleSortReset}
              >
                <Text style={styles.resetButtonText}>Resetuj</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setIsSortModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>Zatvori</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <ScrollView>
              <Text style={styles.modalTitle}>Vrsta smještaja:</Text>
              <Picker
                selectedValue={accommodationType}
                onValueChange={setAccommodationType}
                style={styles.picker}
              >
                {accommodationTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type.toLowerCase()} />
                ))}
              </Picker>

              <Text style={styles.modalTitle}>Cjenovni raspon:</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min cijena"
                  value={minPrice.toString()}
                  onChangeText={(text) => setMinPrice(Number(text) || 0)}
                  keyboardType="numeric"
                />
                <Text> - </Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max cijena"
                  value={maxPrice.toString()}
                  onChangeText={(text) => setMaxPrice(Number(text) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.modalTitle}>Dodatne usluge:</Text>
              <View style={styles.amenitiesContainer}>
                {amenities.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityButton,
                      selectedAmenities.includes(amenity) && styles.amenityButtonSelected
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text style={[
                      styles.amenityButtonText,
                      selectedAmenities.includes(amenity) && styles.amenityButtonTextSelected
                    ]}>
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={handleReset}
                >
                  <Text style={styles.resetButtonText}>Resetuj</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => applyFilters()}
                >
                  <Text style={styles.applyButtonText}>Primijeni</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Accommodation List */}
      <ScrollView style={styles.accommodationList}>
        {filteredAccommodations.length === 0 ? (
          <Text style={styles.noResultsText}>Nema rezultata za pretragu.</Text>
        ) : (
          filteredAccommodations.map((accommodation) => (
            <TouchableOpacity 
              key={accommodation.id}
              style={styles.accommodationCard}
              onPress={() => navigation.navigate('RoomDetails', { accommodation })}
            >
              <Image 
                source={accommodation.images?.[0] || require('../assets/download.jpg')} 
                style={styles.accommodationImage}
              />
              <View style={styles.accommodationInfo}>
                <Text style={styles.accommodationName}>{accommodation.name}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.accommodationType}>{accommodation.location}</Text>
                </View>
                <Text style={styles.accommodationPrice}>{accommodation.price} KM / noć</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{accommodation.rating}</Text>
                  <Text style={styles.commentCount}>({accommodation.reviews.length} komentara)</Text>
                </View>
                
                {/* Stars display */}
                <View style={styles.starsContainer}>
                  {[...Array(accommodation.stars || 0)].map((_, index) => (
                    <Ionicons key={index} name="star" size={14} color="#FFD700" />
                  ))}
                </View>

                {/* Amenities display */}
                <View style={styles.amenitiesDisplay}>
                  {accommodation.amenities?.slice(0, 3).map((amenity, index) => (
                    <Text key={index} style={styles.amenityTag}>{amenity}</Text>
                  ))}
                </View>

                <View style={styles.availabilityContainer}>
                  <View style={styles.availabilityWrapper}>
                    <Ionicons 
                      name={accommodation.available ? "checkmark-circle" : "close-circle"} 
                      size={16} 
                      color={accommodation.available ? "green" : "red"} 
                    />
                    <Text style={styles.availabilityText}>
                      {accommodation.available ? " Dostupno" : " Nije dostupno"}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  searchHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  filterSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  filterButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginRight: 5,
  },
  sortButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 25,
    flex: 1,
    marginLeft: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#fff',
    textAlign: 'center',
    marginLeft: 5,
  },
  sortButtonText: {
    color: '#fff',
    textAlign: 'center',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    width: 100,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  amenityButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  amenityButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  amenityButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  amenityButtonTextSelected: {
    color: '#fff',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  resetButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  applyButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  accommodationList: {
    padding: 10,
  },
  accommodationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    height: 160,
  },
  accommodationImage: {
    width: 120,
    height: 160,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  accommodationInfo: {
    flex: 1,
    padding: 10,
  },
  accommodationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  accommodationType: {
    color: '#666',
    marginLeft: 5,
  },
  accommodationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    marginRight: 5,
  },
  commentCount: {
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  amenitiesDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  amenityTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 12,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  availabilityText: {
    marginLeft: 4,
  },
  closeModalButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  closeModalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  }
});

export default RoomsScreen;