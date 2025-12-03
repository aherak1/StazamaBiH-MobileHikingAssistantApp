// AdminEvents.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import EventService from './EventService';

const AdminEvents = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  // Učitavanje događaja kada se ekran fokusira
  useEffect(() => {
    if (isFocused) {
      loadEvents();
    }
  }, [isFocused]);

  // Funkcija za učitavanje događaja
  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventService.getEvents();
      // Sortiranje događaja po datumu (najnoviji prvi)
      const sortedEvents = eventsData.sort((a, b) => 
        new Date(b.eventDate) - new Date(a.eventDate)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Greška pri učitavanju događaja:', error);
      Alert.alert('Greška', 'Nije moguće učitati događaje');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Funkcija za osvježavanje liste događaja
  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  // Funkcija za formatiranje datuma
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}.`;
  };

  // Provjera je li događaj prošao
  const isEventPassed = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate < today;
  };

  // Funkcija za brisanje događaja
  const handleDeleteEvent = (eventId) => {
    Alert.alert(
      'Potvrda brisanja',
      'Jeste li sigurni da želite obrisati ovaj događaj?',
      [
        { text: 'Odustani', style: 'cancel' },
        { 
          text: 'Obriši', 
          style: 'destructive',
          onPress: async () => {
            try {
              await EventService.deleteEvent(eventId);
              // Osvježavanje liste nakon brisanja
              loadEvents();
              Alert.alert('Uspjeh', 'Događaj je uspješno obrisan');
            } catch (error) {
              console.error('Greška pri brisanju događaja:', error);
              Alert.alert('Greška', 'Nije moguće obrisati događaj');
            }
          }
        }
      ]
    );
  };

  // Pomoćna funkcija za dobivanje URL-a slike
  const getImageUrl = (item) => {
    // Prvo provjerimo postoji li images polje i ima li barem jednu sliku
    if (item.images && item.images.length > 0) {
      return item.images[0]; // Vraćamo prvu sliku iz niza
    }
    // Ako nema images polja, provjeri imageUrl
    if (item.imageUrl) {
      return item.imageUrl;
    }
    // Ako ništa od toga ne postoji, vrati placeholder sliku
    return 'https://via.placeholder.com/300x150?text=Stazama+BiH';
  };

  // Komponenta za prikaz pojedinačnog događaja
  const renderEventItem = ({ item }) => {
    const isPastEvent = isEventPassed(item.eventDate);
    
    return (
      <View style={[styles.eventCard, isPastEvent && styles.pastEventCard]}>
        <Image 
          source={{ uri: getImageUrl(item) }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            {isPastEvent && (
              <View style={styles.pastEventBadge}>
                <Text style={styles.pastEventText}>Završeno</Text>
              </View>
            )}
          </View>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={16} color="#666" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Feather name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>{formatDate(item.eventDate)}</Text>
            </View>
          </View>
          
          <View style={styles.eventActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('AdminEventForm', { event: item, isEditing: true })}
            >
              <Feather name="edit" size={18} color="#007AFF" />
              <Text style={styles.actionButtonText}>Uredi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteEvent(item.id)}
            >
              <Feather name="trash-2" size={18} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Obriši</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Prikaz ekrana za učitavanje
  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loaderText}>Učitavanje događaja...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Događaji</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AdminEventForm')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Novi događaj</Text>
        </TouchableOpacity>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="calendar" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Nema dostupnih događaja</Text>
          <Text style={styles.emptySubtext}>Kreiraj novi događaj pritiskom na dugme iznad</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  listContainer: {
    padding: 12,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pastEventCard: {
    opacity: 0.7,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  pastEventBadge: {
    backgroundColor: '#FF9500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  pastEventText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  eventDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  eventActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 12,
  },
  actionButtonText: {
    marginLeft: 5,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  }
});

export default AdminEvents;