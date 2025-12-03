import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  FlatList,
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from './MapScreen';
import PlacesScreen from './PlacesScreen';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RouteDetailScreen = ({ route, navigation }) => {
  const { mountainName, ruta } = route.params;
  const [komentar, setKomentar] = useState('');
  const [komentari, setKomentari] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [editingCommentRating, setEditingCommentRating] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [rating, setRating] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisited, setIsVisited] = useState(false);
  const [currentUser, setCurrentUser] = useState('Gost'); // Promjenjeno da bude konzistentno

  const flatListRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUserData = await AsyncStorage.getItem('currentUser');
        if (currentUserData) {
          const parsedUserData = JSON.parse(currentUserData);
          const fullName = `${parsedUserData.firstName || ''} ${parsedUserData.lastName || ''}`.trim();
          setCurrentUser(fullName || 'Gost');
        } else {
          setCurrentUser('Gost');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setCurrentUser('Gost');
      }
    };

    loadUserData();
    loadComments();
    checkIfVisited();
    startAutoRotation();
    return () => clearInterval(intervalRef.current);
  }, []);
  
  const checkIfVisited = async () => {
    try {
      const visitedTrails = await AsyncStorage.getItem('visitedTrails');
      if (visitedTrails) {
        const trails = JSON.parse(visitedTrails);
        const found = trails.some(trail => trail.id === ruta.id);
        setIsVisited(found);
      }
    } catch (error) {
      console.error('Error checking visited trails:', error);
    }
  };

  const loadComments = async () => {
    try {
      const savedComments = await AsyncStorage.getItem(`comments_${ruta.naziv}_${ruta.id}`);
      setKomentari(savedComments ? JSON.parse(savedComments) : ruta.komentari);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const calculateAverageRating = () => {
    if (komentari.length === 0) return 0;
    const total = komentari.reduce((sum, comment) => sum + comment.rating, 0);
    return (total / komentari.length).toFixed(1);
  };

  const saveComments = async (newComments) => {
    try {
      await AsyncStorage.setItem(`comments_${ruta.naziv}_${ruta.id}`, JSON.stringify(newComments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };
  
  const handleVisitTrail = async () => {
    if (currentUser === 'Gost') { // Promjenjeno da bude konzistentno
      Alert.alert('Greška', 'Morate biti prijavljeni da biste evidentirali posjetu.');
      return;
    }

    try {
      const visitedTrailData = {
        id: ruta.id,
        naziv: ruta.naziv,
        lokacija: ruta.lokacija,
        slike: ruta.slike,
        opis: ruta.opis,
        datumPosjete: new Date().toISOString(),
        mountainName: mountainName,
        rating: calculateAverageRating(),
        visitId: new Date().getTime().toString(),
        korisnik: currentUser
      };

      let visitedTrails = await AsyncStorage.getItem('visitedTrails');
      visitedTrails = visitedTrails ? JSON.parse(visitedTrails) : [];
      visitedTrails.push(visitedTrailData);
      await AsyncStorage.setItem('visitedTrails', JSON.stringify(visitedTrails));

      Alert.alert('Posjeta zabilježena', `Uspješno ste evidentirali posjetu stazi "${ruta.naziv}"`);
    } catch (error) {
      console.error('Error saving visited trail:', error);
      Alert.alert('Greška', 'Došlo je do greške pri evidentiranju posjete');
    }
  };
      
  const startAutoRotation = () => {
    clearInterval(intervalRef.current);
    if (ruta.slike.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % ruta.slike.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
    }
  };

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffset / SCREEN_WIDTH);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  const renderImage = ({ item }) => (
    <Image 
      source={item} 
      style={styles.image}
      resizeMode="cover"
    />
  );

  const handleAddComment = async () => {
    if (currentUser === 'Gost') {
      Alert.alert('Greška', 'Morate biti prijavljeni da biste dodali komentar.');
      return;
    }

    if (komentar.trim() === '') {
      Alert.alert('Greška', 'Molimo unesite komentar.');
      return;
    }

    if (rating.trim() === '' || isNaN(rating) || rating < 0 || rating > 5) {
      Alert.alert('Greška', 'Molimo unesite valjanu ocjenu između 0 i 5.');
      return;
    }

    const noviKomentar = {
      id: new Date().toISOString(),
      korisnik: currentUser,
      tekst: komentar.trim(), // Dodano .trim()
      rating: parseInt(rating, 10),
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [noviKomentar, ...komentari];
    setKomentari(updatedComments);
    setKomentar('');
    setRating('');
    await saveComments(updatedComments);

    const newCommentData = {
      id: noviKomentar.id,
      korisnik: currentUser,
      tekst: noviKomentar.tekst,
      name: ruta.naziv,
      type: 'route',
      rating: noviKomentar.rating,
      timestamp: noviKomentar.timestamp,
    };

    try {
      const existingComments = await AsyncStorage.getItem('comment_history');
      let comments = existingComments ? JSON.parse(existingComments) : [];
      comments.push(newCommentData);
      await AsyncStorage.setItem('comment_history', JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comment to history', error);
    }

    Alert.alert('Uspjeh', 'Vaš komentar je dodat.');
  };

  const handleEditComment = (id) => {
    const commentToEdit = komentari.find(comment => comment.id === id);
    setEditingCommentId(id);
    setEditingCommentText(commentToEdit.tekst);
    setEditingCommentRating(commentToEdit.rating.toString());
  };

  const handleSaveEditComment = async () => {
    if (editingCommentText.trim() === '') {
      Alert.alert('Greška', 'Molimo unesite komentar.');
      return;
    }

    if (editingCommentRating.trim() === '' || isNaN(editingCommentRating) || editingCommentRating < 0 || editingCommentRating > 5) {
      Alert.alert('Greška', 'Molimo unesite valjanu ocjenu između 0 i 5.');
      return;
    }

    const updatedComments = komentari.map(comment => 
      comment.id === editingCommentId ? { 
        ...comment, 
        tekst: editingCommentText.trim(), // Dodano .trim()
        rating: parseInt(editingCommentRating, 10) 
      } : comment
    );

    setKomentari(updatedComments);
    setEditingCommentId(null);
    setEditingCommentText('');
    setEditingCommentRating('');
    await saveComments(updatedComments);

    Alert.alert('Uspjeh', 'Vaš komentar je uređen.');
  };

  const handleDeleteComment = async (id) => {
    Alert.alert(
      'Brisanje komentara',
      'Jeste li sigurni da želite obrisati ovaj komentar?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          onPress: async () => {
            const updatedComments = komentari.filter(comment => comment.id !== id);
            setKomentari(updatedComments);
            await saveComments(updatedComments);
            Alert.alert('Uspjeh', 'Vaš komentar je obrisan.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  const displayedComments = showAllComments ? komentari : komentari.slice(0, 3);
  
  const handleShowMap = () => {
    navigation.navigate('MapScreen', { 
      location: ruta.lokacija.toLowerCase(),
      routeId: ruta.id, 
      mountainName: mountainName 
    });
  };

  const handleShowPlaces = () => {
    navigation.navigate('PlacesScreen', { 
      coordinates: ruta.koordinate.start 
    });
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Galerija slika */}
      <View style={styles.imageContainer}>
        <FlatList
          ref={flatListRef}
          data={ruta.slike}
          renderItem={renderImage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialScrollIndex={currentImageIndex}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.gradientHeader}
        >
          <Text style={styles.routeTitle}>{ruta.naziv}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={18} color="#fff" />
            <Text style={styles.locationText}>{ruta.lokacija}</Text>
          </View>
          <View style={styles.ratingHeader}>
            <Text style={styles.averageRatingText}>
              Prosječna ocjena: {calculateAverageRating()}
            </Text>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.round(calculateAverageRating()) ? 'star' : 'star-outline'}
                  size={18}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.pagination}>
          {ruta.slike.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentImageIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Detalji o stazi */}
      <View style={styles.content}>
        <View style={styles.section}>
          <Ionicons name="information-circle" size={26} color="#008080" />
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Opis staze</Text>
            <View style={styles.separator} />
            <Text style={styles.sectionText}>{ruta.opis}</Text>
          </View>
        </View>

        {/* Sigurnosne napomene */}
        <View style={styles.section}>
          <Ionicons name="shield-checkmark" size={24} color="#e74c3c" />
          <View style={styles.sectionContent}>
            <Text style={styles.safetyHeader}>Sigurnosne smjernice</Text>
            
            {ruta.sigurnosneNapomene?.obaveznaOprema && (
              <View style={styles.safetyCategory}>
                <Text style={styles.safetySubtitle}>
                  <Ionicons name="bag-check" size={18} color="#2ecc71" /> Obavezna oprema:
                </Text>
                {ruta.sigurnosneNapomene.obaveznaOprema.map((item, index) => (
                  <Text key={index} style={styles.safetyItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            )}

            {ruta.sigurnosneNapomene?.preporuke && (
              <View style={styles.safetyCategory}>
                <Text style={styles.safetySubtitle}>
                  <Ionicons name="thumbs-up" size={18} color="#3498db" /> Preporučeno:
                </Text>
                {ruta.sigurnosneNapomene.preporuke.map((item, index) => (
                  <Text key={index} style={styles.safetyItem}>
                    › {item}
                  </Text>
                ))}
              </View>
            )}

            {ruta.sigurnosneNapomene?.upozorenja && (
              <View style={styles.safetyCategory}>
                <Text style={styles.safetySubtitle}>
                  <Ionicons name="alert-circle" size={18} color="#e67e22" /> Upozorenja:
                </Text>
                {ruta.sigurnosneNapomene.upozorenja.map((item, index) => (
                  <Text key={index} style={[styles.safetyItem, styles.warningItem]}>
                    ⚠ {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Akcijski dugmići */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShowMap}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="map" size={28} color="#2ecc71" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Prikaži stazu na mapi</Text>
              <Text style={styles.buttonSubtitle}>Vidi detaljan prikaz trase</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#95a5a6" />
          </TouchableOpacity>
         
          <TouchableOpacity
            style={[styles.actionButton, styles.visitButton]}
            onPress={handleVisitTrail}
          >
            <View style={[styles.buttonIconContainer, styles.visitButtonIcon]}>
              <Ionicons name="footsteps" size={28} color="#fff" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, styles.visitButtonTitle]}>Evidentiraj posjetu</Text>
              <Text style={[styles.buttonSubtitle, styles.visitButtonSubtitle]}>Kliknite da zabilježite svoj posjet</Text>
            </View>
          </TouchableOpacity> 

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShowPlaces}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="restaurant" size={28} color="#e74c3c" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Objekti u blizini</Text>
              <Text style={styles.buttonSubtitle}>Restorani, hoteli, kafići</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#95a5a6" />
          </TouchableOpacity>
        </View>

        {/* Komentari - AŽURIRANO DA BUDE KONZISTENTNO */}
        <View style={styles.reviewsCard}>
          <Text style={styles.reviewsHeader}>Komentari i recenzije:</Text>
          
          {displayedComments.map((komentar) => (
            <View key={komentar.id} style={styles.comment}>
              <Text style={styles.commentText}>
                <Text style={styles.commentUser}>{komentar.korisnik}: </Text>
                {komentar.tekst}
              </Text>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < komentar.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.commentTimestamp}>
                Dodano: {moment(komentar.timestamp).format('D. MMMM YYYY. HH:mm:ss')}
              </Text>
              {komentar.korisnik === currentUser && (
                <View style={styles.commentActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditComment(komentar.id)}
                  >
                    <Ionicons name="create" size={20} color="#007BFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteComment(komentar.id)}
                  >
                    <Ionicons name="trash" size={20} color="#ff0000" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {komentari.length > 3 && (
            <TouchableOpacity onPress={toggleShowAllComments}>
              <Text style={styles.showAllCommentsText}>
                {showAllComments ? 'Prikaži manje' : 'Prikaži sve komentare'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Forma za uređivanje komentara */}
          {editingCommentId && (
            <View style={styles.inputContainer}>
              <Text style={styles.editHeader}>Uređivanje komentara:</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Uredite komentar"
                value={editingCommentText}
                onChangeText={setEditingCommentText}
              />
              <View style={styles.ratingInputContainer}>
                <Text style={styles.ratingInputLabel}>Ocjena:</Text>
                <TextInput
                  style={styles.ratingInput}
                  value={editingCommentRating}
                  onChangeText={setEditingCommentRating}
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>
              <TouchableOpacity 
                style={styles.addCommentButton}
                onPress={handleSaveEditComment}
              >
                <Text style={styles.addCommentButtonText}>Sačuvaj promjene</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelEditButton}
                onPress={() => {
                  setEditingCommentId(null);
                  setEditingCommentText('');
                  setEditingCommentRating('');
                }}
              >
                <Text style={styles.cancelEditButtonText}>Odustani</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Forma za dodavanje komentara */}
          {!editingCommentId && (
            <View style={styles.addCommentContainer}>
              <Text style={styles.currentUserInfo}>
                Komentirate kao: <Text style={styles.currentUserName}>{currentUser}</Text>
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Unesite vaš komentar..."
                value={komentar}
                onChangeText={setKomentar}
              />
              <View style={styles.ratingInputContainer}>
                <Text style={styles.ratingInputLabel}>Ocjena:</Text>
                <TextInput
                  style={styles.ratingInput}
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>
              <TouchableOpacity 
                style={styles.addCommentButton}
                onPress={handleAddComment}
              >
                <Text style={styles.addCommentButtonText}>Dodaj komentar</Text>
              </TouchableOpacity>
              {currentUser === 'Gost' && (
                <Text style={styles.guestWarning}>
                  Morate biti prijavljeni da biste ostavili komentar.
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 250,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  gradientHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 50,
  },
  routeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 8,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  averageRatingText: {
    fontSize: 18,
    color: 'white',
    marginRight: 8,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  content: {
    padding: 18,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    marginBottom: 22,
  },
  sectionContent: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  safetyHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e74c3c',
    paddingBottom: 4,
  },
  separator: {
    height: 2,
    backgroundColor: '#008080',
    marginVertical: 4,
  },
  safetyCategory: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  safetySubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  safetyItem: {
    fontSize: 17,
    color: '#7f8c8d',
    lineHeight: 20,
    marginLeft: 6,
    marginBottom: 4,
  },
  warningItem: {
    color: '#c0392b',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    marginVertical: 15,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonIconContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  visitButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  visitButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  visitButtonTitle: {
    color: '#fff',
  },
  visitButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // AŽURIRANI STILOVI ZA KOMENTARE - KONZISTENTNO S RoomDetails.js
  reviewsCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  comment: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  commentText: {
    fontSize: 16,
    color: '#333',
  },
  commentUser: {
    fontWeight: 'bold',
  },
  currentUserName: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  showAllCommentsText: {
    color: '#007BFF',
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  ratingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingInputLabel: {
    fontSize: 16,
    marginRight: 10,
    color: '#333',
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
    width: 50,
    textAlign: 'center',
    backgroundColor: '#fff',
  },addCommentButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addCommentButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelEditButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  addCommentHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  editHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  actionButtonsContainer: {
    marginVertical: 15,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonIconContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  visitButton: {
    backgroundColor: '#4CAF50', // Svijetlo zelena boja
    borderColor: '#388E3C', // Tamnija zelena za border
  },
  visitButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  visitButtonTitle: {
    color: '#fff',
  },
  visitButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default RouteDetailScreen; 