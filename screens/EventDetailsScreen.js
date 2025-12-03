// EventDetailsScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  Share
} from 'react-native';
import { Feather, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import EventService from './Admin/EventService';
import ImageStorageService from './Admin/ImageStorageService'; // Dodano

const { width } = Dimensions.get('window');
const IMAGE_TOP_MARGIN = 8; // Added margin from top

const EventDetailsScreen = ({ route, navigation }) => {
  const { event: initialEvent } = route.params;
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef(null);
  const role = route.params?.role || 'user';
  
  const [imageUrls, setImageUrls] = useState([]);
  const autoScrollTimer = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const dan = date.getDate();
    const mjesec = date.getMonth() + 1;
    const godina = date.getFullYear();
    
    const mjeseci = [
      'januar', 'februar', 'mart', 'april', 'maj', 'juni',
      'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'
    ];
    
    return `${dan}. ${mjeseci[mjesec-1]} ${godina}.`;
  };

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const refreshedEvent = await EventService.getEventById(event.id);
      if (refreshedEvent) {
        setEvent(refreshedEvent);
        // Ažuriraj slike nakon učitavanja događaja
        await loadImages(refreshedEvent);
      }
    } catch (error) {
      console.error('Greška pri učitavanju detalja događaja:', error);
      Alert.alert('Greška', 'Nije moguće učitati detalje događaja');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (eventData = event) => {
    try {
      let images = [];
      
      if (eventData.images && Array.isArray(eventData.images) && eventData.images.length > 0) {
        images = [...eventData.images];
      } else if (eventData.imageUrl) {
        images.push(eventData.imageUrl);
      }
      
      // Ako nema slika, dodaj placeholder
      if (images.length === 0) {
        images.push('https://via.placeholder.com/800x400?text=Stazama+BiH');
      }
      
      // Provjeri i očisti listu slika koristeći ImageStorageService
      const validImages = await ImageStorageService.cleanImageList(images);
      
      setImageUrls(validImages);
      
      // Ako je lista slika promijenjena (zbog nepostojećih slika), ažuriraj događaj
      if (validImages.length !== images.length || 
          !validImages.every((img, index) => img === images[index])) {
        
        // Ažuriraj događaj sa ispravnim slikama
        const updatedEvent = { ...eventData, images: validImages };
        setEvent(updatedEvent);
        
        // Spremi promjene u bazu podataka
        try {
          await EventService.updateEvent(eventData.id, { images: validImages });
        } catch (updateError) {
          console.error('Greška pri ažuriranju slika događaja:', updateError);
        }
      }
      
    } catch (error) {
      console.error('Greška pri učitavanju slika:', error);
      // U slučaju greške, postavi placeholder
      setImageUrls(['https://via.placeholder.com/800x400?text=Stazama+BiH']);
    }
  };

  const startAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
    
    if (imageUrls.length > 1) {
      autoScrollTimer.current = setInterval(() => {
        const nextIndex = (currentImageIndex + 1) % imageUrls.length;
        setCurrentImageIndex(nextIndex);
        
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            animated: true,
            index: nextIndex
          });
        }
      }, 4000);
    }
  };

  useEffect(() => {
    loadEventDetails();
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (imageUrls.length > 0) {
      startAutoScroll();
    }
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [imageUrls, currentImageIndex]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pogledaj ovaj događaj: ${event.title} - Datum: ${formatDate(event.eventDate)} - Lokacija: ${event.location}`,
        title: event.title
      });
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće podijeliti događaj');
    }
  };

  const handleOpenMap = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`;
    Linking.openURL(mapUrl)
      .catch(err => Alert.alert('Greška', 'Nije moguće otvoriti mapu'));
  };

  const renderImageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image 
        source={{ uri: item }} 
        style={styles.carouselImage}
        resizeMode="cover"
        onError={(error) => {
          console.error('Greška pri učitavanju slike:', error.nativeEvent.error);
          // Možete dodati logiku za zamjenu neispravne slike sa placeholder
        }}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loaderText}>Učitavanje...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Carousel slika */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={imageUrls}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentImageIndex(newIndex);
            startAutoScroll();
          }}
        />
        
        {imageUrls.length > 1 && (
          <View style={styles.paginationContainer}>
            {imageUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { 
                    opacity: index === currentImageIndex ? 1 : 0.5,
                    
                  }
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Sadržaj događaja */}
      <View style={styles.contentContainer}>
        {/* Naslov i akcije */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleShare}
            >
              <Feather name="share-2" size={22} color="#4CAF50" />
            </TouchableOpacity>
            
            {role === 'admin' && (
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('AdminEventForm', { event, isEditing: true })}
              >
                <Feather name="edit" size={22} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Osnovne informacije */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color="#4CAF50" style={styles.infoIcon} />
            <Text style={styles.infoText}>{formatDate(event.eventDate)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.infoRow}
            onPress={handleOpenMap}
          >
            <FontAwesome name="map-marker" size={20} color="#4CAF50" style={styles.infoIcon} />
            <Text style={[styles.infoText, styles.locationText]}>{event.location}</Text>
            <Feather name="external-link" size={16} color="#4CAF50" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          
          {event.difficulty && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="hiking" size={20} color="#4CAF50" style={styles.infoIcon} />
              <Text style={styles.infoText}>Težina: {event.difficulty}</Text>
            </View>
          )}
        </View>

        {/* Opis događaja */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Opis</Text>
          </View>
          <Text style={styles.description}>{event.description}</Text>
        </View>
        
        {/* Detaljni opis */}
        {event.detailedDescription && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="info" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Detalji događaja</Text>
            </View>
            <Text style={styles.details}>{event.detailedDescription}</Text>
          </View>
        )}
        
        {/* Oprema */}
        {event.equipment && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="hiking" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Potrebna oprema</Text>
            </View>
            {Array.isArray(event.equipment) ? (
              <View style={styles.equipmentList}>
                {event.equipment.map((item, index) => (
                  <View key={index} style={styles.equipmentItem}>
                    <Feather name="check" size={16} color="#4CAF50" style={styles.checkIcon} />
                    <Text style={styles.equipmentText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.details}>{event.equipment}</Text>
            )}
          </View>
        )}
        
        {/* Bilješke */}
        {event.notes && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Feather name="alert-circle" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Napomene</Text>
            </View>
            <Text style={styles.details}>{event.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  carouselContainer: {
    position: 'relative',
    height: 250,
    marginTop: IMAGE_TOP_MARGIN, // Added top margin
    marginBottom: 16,
  },
  imageContainer: {
    width: width - 32,
    height: 240, // Slightly reduced height to accommodate top margin
    marginHorizontal: 16,
    borderRadius: 8, // More subtle rounded corners
    overflow: 'hidden',
    borderWidth: 1, // Subtle border
    borderColor: 'rgba(0,0,0,0.05)', // Very light border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  locationText: {
    color: '#4CAF50',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
    color: '#444',
  },
  details: {
    fontSize: 17,
    lineHeight: 24,
    color: '#444',
  },
  equipmentList: {
    marginTop: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 8,
  },
  equipmentText: {
    fontSize: 16,
    color: '#444',
  },
});

export default EventDetailsScreen;