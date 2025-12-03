import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Modal,
  Button,
  Alert,
  BackHandler
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Carousel from '../components/Carousel';
import { routesData } from './routesData';
import * as ImagePicker from 'expo-image-picker';
import EventService from './Admin/EventService';

const HomeScreen = ({ navigation }) => {
  const route = useRoute();
  const role = route.params?.role || 'user';
  const [searchQuery, setSearchQuery] = useState('');
  const [showError, setShowError] = useState(false);
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    description: '',
    details: '',
    location: '',
    images: []
  });

  // Handler za dugme nazad
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Izlazak iz aplikacije",
          "Da li ste sigurni da želite izaći iz aplikacije?",
          [
            {
              text: "Odustani",
              onPress: () => null,
              style: "cancel"
            },
            { 
              text: "Izađi", 
              onPress: () => {
                // Vraćamo se na ekran za prijavu (Login)
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
        return true; // Vraćamo true da spriječimo standardno ponašanje
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  // Funkcija za formatiranje datuma
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Ako formatiranje ne uspije, vrati izvorni string
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}.`;
  };

  // Učitavanje događaja iz EventService
  const loadEvents = async () => {
    try {
      const eventsData = await EventService.getEvents();
      // Sortiraj događaje po datumu (najnoviji prvi)
      const sortedEvents = eventsData.sort((a, b) => 
        new Date(b.eventDate) - new Date(a.eventDate)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Greška pri učitavanju događaja:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju događaja');
    }
  };

  // Inicijalno učitavanje događaja
  useEffect(() => {
    loadEvents();
  }, []);

  // Osvježavanje događaja prilikom fokusiranja ekrana
  useFocusEffect(
    React.useCallback(() => {
      loadEvents();
      setSearchQuery('');
      setShowError(false);
      return () => {};
    }, [])
  );

  const mountainCoordinates = {
    'trebević': { lat: 43.849, lon: 18.435 },
    'ozren': { lat: 44.407, lon: 18.583 },
    'jahorina': { lat: 43.713, lon: 18.621 },
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.trim().toLowerCase();
      const mountainRoutes = routesData[searchTerm];

      setShowError(false);

      if (mountainRoutes) {
        navigation.navigate('RouteList', {
          mountainName: searchQuery.trim(),
          routes: mountainRoutes,
          coordinates: mountainCoordinates[searchTerm],
        });
        setSearchQuery('');
      } else {
        setShowError(true);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewEvent({...newEvent, images: [result.assets[0].uri]});
    }
  };

  // Parsiranje i validacija datuma
  const parseDate = (dateStr) => {
    // Provjeri različite formate datuma
    let date;
    // Pokušaj parsirati format "20. januar 2025."
    const dateMatch = dateStr.match(/(\d+)\.?\s+([a-zA-Z]+)\s+(\d{4})\.?/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      let month;
      const monthName = dateMatch[2].toLowerCase();
      
      // Mapa mjeseci na bosanskom
      const monthMap = {
        'januar': 0, 'februar': 1, 'mart': 2, 'april': 3,
        'maj': 4, 'juni': 5, 'juli': 6, 'august': 7,
        'septembar': 8, 'oktobar': 9, 'novembar': 10, 'decembar': 11
      };
      
      month = monthMap[monthName];
      const year = parseInt(dateMatch[3]);
      
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        date = new Date(year, month, day);
      }
    }
    
    // Ako prvi format ne uspije, pokušaj standardni DD.MM.YYYY format
    if (!date || isNaN(date.getTime())) {
      const parts = dateStr.split('.');
      if (parts.length >= 3) {
        const day = parseInt(parts[0].trim());
        const month = parseInt(parts[1].trim()) - 1; // JavaScript mjeseci su 0-indeksirani
        const year = parseInt(parts[2].trim());
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          date = new Date(year, month, day);
        }
      }
    }
    
    // Ako nijedan format ne uspije, koristi današnji datum
    if (!date || isNaN(date.getTime())) {
      console.warn('Nevažeći format datuma, koristim današnji datum');
      date = new Date();
    }
    
    return date;
  };

  // Pomoćna funkcija za dobivanje URL-a slike
  const getImageUrl = (event) => {
    // Prvo provjerimo postoji li images polje i ima li barem jednu sliku
    if (event.images && event.images.length > 0) {
      return event.images[0]; // Vraćamo prvu sliku iz niza
    }
    // Ako nema images polja, provjeri imageUrl
    if (event.imageUrl) {
      return event.imageUrl;
    }
    // Ako ništa od toga ne postoji, vrati placeholder sliku
    return 'https://via.placeholder.com/300x200?text=Stazama+BiH';
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.description || !newEvent.location) {
      Alert.alert('Greška', 'Popunite sva obavezna polja');
      return;
    }

    try {
      // Parsiramo datum iz unesenog teksta
      const eventDate = parseDate(newEvent.date);
      
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        location: newEvent.location,
        eventDate: eventDate.toISOString(),
        images: newEvent.images.length > 0 ? newEvent.images : ['https://via.placeholder.com/300x200?text=Stazama+BiH'],
        maxParticipants: 0,
        difficulty: 'Srednje',
        participants: []
      };

      const success = await EventService.addEvent(eventData);
      if (success) {
        await loadEvents(); // Osvježavamo listu događaja
        setNewEvent({
          title: '',
          date: '',
          description: '',
          details: '',
          location: '',
          images: []
        });
        setIsModalVisible(false);
        Alert.alert('Uspjeh', 'Događaj je uspješno dodan');
      }
    } catch (error) {
      console.error('Greška pri dodavanju događaja:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja događaja');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Potvrda brisanja',
      'Jeste li sigurni da želite obrisati ovaj događaj?',
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Obriši',
          onPress: async () => {
            try {
              await EventService.deleteEvent(eventId);
              await loadEvents(); // Osvježavamo listu događaja
              Alert.alert('Uspjeh', 'Događaj je uspješno obrisan');
            } catch (error) {
              console.error('Greška pri brisanju događaja:', error);
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja događaja');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleEditEvent = (event) => {
    if (role === 'admin') {
      navigation.navigate('AdminEventForm', {
        isEditing: true,
        event: event
      });
    }
  };

  const renderEvent = (event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { event })}
    >
      <View style={styles.eventImageContainer}>
        <Image source={{ uri: getImageUrl(event) }} style={styles.eventImage} />
      </View>
      <View style={styles.eventTextContainer}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={14} color="#666" style={styles.infoIcon} />
            <Text style={styles.eventDate}>{formatDate(event.eventDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color="#666" style={styles.infoIcon} />
            <Text style={styles.eventLocation}>{event.location || 'Lokacija nije specificirana'}</Text>
          </View>
        </View>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
      </View>
      
      {role === 'admin' && (
        <View style={styles.adminControls}>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => handleEditEvent(event)}
          >
            <Feather name="edit" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => handleDeleteEvent(event.id)}
          >
            <Feather name="trash-2" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Carousel />

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Unesite naziv planine..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Feather name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {showError && (
          <Text style={styles.errorText}>Greška: Planina nije pronađena</Text>
        )}
      </View>

      <View style={styles.newsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Novosti i zanimljivosti</Text>
          {role === 'admin' && (
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Feather name="plus-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
        
        {events.length > 0 ? (
          events.map(renderEvent)
        ) : (
          <Text style={styles.noEventsText}>Trenutno nema dostupnih događaja</Text>
        )}
      </View>

      <Modal visible={isModalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Dodaj novi događaj</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Naslov događaja*"
            value={newEvent.title}
            onChangeText={text => setNewEvent({...newEvent, title: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Datum* (npr. 20.5.2025. ili 20. maj 2025.)"
            value={newEvent.date}
            onChangeText={text => setNewEvent({...newEvent, date: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Lokacija događaja*"
            value={newEvent.location}
            onChangeText={text => setNewEvent({...newEvent, location: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Kratki opis*"
            value={newEvent.description}
            onChangeText={text => setNewEvent({...newEvent, description: text})}
          />
          
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Detalji (opcionalno)"
            multiline
            value={newEvent.details}
            onChangeText={text => setNewEvent({...newEvent, details: text})}
          />

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text>Odaberi sliku</Text>
            <Feather name="image" size={24} color="#007AFF" />
          </TouchableOpacity>

          {newEvent.images.length > 0 && (
            <Image 
              source={{ uri: newEvent.images[0] }} 
              style={styles.previewImage} 
            />
          )}

          <View style={styles.modalButtons}>
            <Button 
              title="Otkaži" 
              onPress={() => {
                setIsModalVisible(false);
                setNewEvent({
                  title: '',
                  date: '',
                  description: '',
                  details: '',
                  location: '',
                  images: []
                });
              }} 
              color="red" 
            />
            <Button 
              title="Spremi" 
              onPress={handleAddEvent} 
            />
          </View>
        </ScrollView>
      </Modal>

      {role === 'admin' && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AdminEvents')}
        >
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    alignItems: 'center',
    padding: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingLeft: 10,
  },
  searchButton: {
    padding: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    padding: 16,
    textAlign: 'center',
    backgroundColor: '#ffe6e6',
    fontWeight: 'bold',
    marginTop: 8,
    borderRadius: 8,
  },
  newsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  eventCard: {
    marginBottom: 16,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventImageContainer: {
    width: 120,
    height: 120,
    padding: 5,
    alignSelf: 'center',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  eventTextContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 40,
    padding: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
    lineHeight: 20,
    ellipsizeMode: 'tail',
    numberOfLines: 1,
  },
  eventInfo: {
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoIcon: {
    marginRight: 5,
  },
  eventDate: {
    fontSize: 15,
    color: '#666',
  },
  eventLocation: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
    ellipsizeMode: 'tail',
    numberOfLines: 1,
  },
  eventDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 18,
    maxHeight: 36,
    ellipsizeMode: 'tail',
    numberOfLines: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  adminControls: {
    position: 'absolute',
    right: 8,
    top: 8,
    flexDirection: 'column',
  },
  adminButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    marginBottom: 8,
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    padding: 20,
  }
});

export default HomeScreen;