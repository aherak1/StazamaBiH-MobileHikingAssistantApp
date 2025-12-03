import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  FlatList, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import accommodationsData from './accommodationsData';
import moment from 'moment'; // Dodajte ovaj uvoz

const RoomDetails = ({ route }) => {
  const { accommodation } = route.params;
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [currentUser, setCurrentUser] = useState('Gost'); // Inicijalno postavljeno na "Gost"
  const navigation = useNavigation();

  useEffect(() => {
    loadComments();
    loadCurrentUser(); // Učitaj trenutno prijavljenog korisnika
  }, []);

  // Funkcija za učitavanje trenutno prijavljenog korisnika
  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        // Postavljanje imena i prezimena korisnika
        const fullName = `${parsedUserData.firstName || ''} ${parsedUserData.lastName || ''}`.trim();
        setCurrentUser(fullName || 'Gost'); // Ako iz nekog razloga nema imena, postavi na "Gost"
      } else {
        setCurrentUser('Gost');
      }
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
      setCurrentUser('Gost');
    }
  };

  const loadComments = async () => {
    try {
      const savedComments = await AsyncStorage.getItem(`comments_${accommodation.name}`);
      if (savedComments) {
        setReviews(JSON.parse(savedComments));
      } else {
        setReviews(accommodation.reviews);
      }
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const saveComments = async (newComments) => {
    try {
      await AsyncStorage.setItem(`comments_${accommodation.name}`, JSON.stringify(newComments));
    } catch (error) {
      console.error('Failed to save comments', error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      Alert.alert('Greška', 'Molimo unesite komentar.');
      return;
    }

    if (newRating.trim() === '' || isNaN(newRating) || newRating < 0 || newRating > 5) {
      Alert.alert('Greška', 'Molimo unesite valjanu ocjenu između 0 i 5.');
      return;
    }

    // Provjera da li je korisnik prijavljen - ako je "Gost", ne može komentirati
    if (currentUser === 'Gost') {
      Alert.alert('Greška', 'Morate biti prijavljeni da biste dodali komentar.');
      return;
    }

    const newReview = {
      id: new Date().toISOString(), // Dodajemo ID
      username: currentUser, // Koristi ime trenutno prijavljenog korisnika
      rating: parseInt(newRating, 10),
      comment: newComment.trim(),
      timestamp: new Date().toISOString(), // Dodajemo timestamp
    };

    let updatedReviews;
    if (editMode && editIndex !== null) {
      updatedReviews = reviews.map((review, index) =>
        index === editIndex ? newReview : review
      );
      setEditMode(false);
      setEditIndex(null);
      Alert.alert('Uspjeh', 'Vaš komentar je uređen.');
    } else {
      updatedReviews = [newReview, ...reviews];
      Alert.alert('Uspjeh', 'Vaš komentar je dodat.');
    }

    setReviews(updatedReviews);
    setNewComment('');
    setNewRating('');
    await saveComments(updatedReviews);

    // Spremi komentar u historiju (neovisno o brisanju)
    const newCommentData = {
      id: newReview.id, // ID komentara
      korisnik: currentUser,
      tekst: newReview.comment,
      name: accommodation.name, // Standardizirano polje za ime
      type: 'accommodation', // Tip komentara
      rating: newReview.rating, // Ocjena
      timestamp: newReview.timestamp, // Vrijeme
    };

    try {
      const existingComments = await AsyncStorage.getItem('comment_history');
      let comments = existingComments ? JSON.parse(existingComments) : [];
      comments.push(newCommentData);
      await AsyncStorage.setItem('comment_history', JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comment to history', error);
    }
  };

  const handleEditComment = (index) => {
    const commentToEdit = reviews[index];
    setEditMode(true);
    setEditIndex(index);
    setNewComment(commentToEdit.comment);
    setNewRating(commentToEdit.rating.toString());
  };

  const handleDeleteComment = async (index) => {
    Alert.alert(
      'Brisanje komentara',
      'Jeste li sigurni da želite obrisati ovaj komentar?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          onPress: async () => {
            const updatedReviews = reviews.filter((_, i) => i !== index);
            setReviews(updatedReviews);
            Alert.alert('Uspjeh', 'Vaš komentar je obrisan.');

            await saveComments(updatedReviews);

            // NE brišemo komentar iz historije!
          },
          style: 'destructive',
        },
      ]
    );
  };

  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  const displayedReviews = showAllComments ? reviews : reviews.slice(0, 3);

  const isAvailable = accommodation.available > 0;
  const reservedText = `${accommodation.reserved} rezervisano od ${accommodation.available + accommodation.reserved} dostupnih`;

  const renderAmenity = (amenity) => {
    let iconName;
    let amenityText;

    switch (amenity) {
      case 'Wi-Fi':
        iconName = 'wifi';
        amenityText = 'Besplatan Wi-Fi';
        break;
      case 'Parking':
        iconName = 'car';
        amenityText = 'Privatni parking';
        break;
      case 'Obiteljske sobe':
        iconName = 'account-group';
        amenityText = 'Obiteljske sobe';
        break;
      case 'Spa centar':
        iconName = 'spa';
        amenityText = 'Spa centar';
        break;
      case 'Restoran':
        iconName = 'silverware-fork-knife';
        amenityText = 'Restoran';
        break;
      case 'Bar':
        iconName = 'glass-cocktail';
        amenityText = 'Bar';
        break;
      case 'Fitness-centar':
        iconName = 'dumbbell';
        amenityText = 'Fitness-centar';
        break;
      case 'Doručak':
        iconName = 'food';
        amenityText = 'Doručak';
        break;
      case 'Skijanje':
        iconName = 'snowflake';
        amenityText = 'Skijanje';
        break;
      case 'Dvorist':
        iconName = 'tree';
        amenityText = 'Dvorište';
        break;
      case 'Kućni ljubimci':
        iconName = 'dog';
        amenityText = 'Kućni ljubimci dozvoljeni';
        break;
      case 'Igraonice':
        iconName = 'gamepad-variant';
        amenityText = 'Igraonice';
        break;
      case 'Usluge čisćenja':
        iconName = 'broom';
        amenityText = 'Usluge čišćenja';
        break;
      default:
        iconName = 'information';
        amenityText = amenity;
    }
    return (
      <View key={amenity} style={styles.amenityItem}>
        <MaterialCommunityIcons name={iconName} size={24} color="#666" />
        <Text style={styles.amenityText}>{amenityText}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <FlatList 
        data={accommodation.images}
        horizontal
        renderItem={({ item }) => (
          <Image source={item} style={styles.image} />
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.imageCarousel}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{accommodation.name}</Text>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.location}>{accommodation.location}</Text>
        </View>

        <Text style={styles.price}>{accommodation.price} KM / noć</Text>

        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < accommodation.rating ? 'star' : 'star-outline'}
              size={20}
              color="#FFD700"
            />
          ))}
          <Text style={styles.commentCount}>({reviews.length} komentara)</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Opis:</Text>
          <Text style={styles.descriptionText}>
            {accommodation.longDescription}
          </Text>
        </View>

        <View style={styles.amenitiesContainer}>
          <Text style={styles.amenitiesHeader}>Pogodnosti:</Text>
          <View style={styles.amenitiesList}>
            {accommodation.amenities.map(renderAmenity)}
          </View>
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.contactHeader}>Kontakt:</Text>
          <Text style={styles.contactText}>{accommodation.contact}</Text>
        </View>

        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityStatus}>
            {isAvailable ? 'Dostupno' : 'Nema slobodnih soba'}
          </Text>
          <Text style={styles.reservedText}>{reservedText}</Text>
        </View>

        <View style={styles.reviewsCard}>
          <Text style={styles.reviewsHeader}>Komentari i recenzije:</Text>
          {displayedReviews.map((review, index) => (
            <View key={index} style={styles.comment}>
              <Text style={styles.commentText}><Text style={styles.commentUser}>{review.username}: </Text>{review.comment}</Text>
              <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text style={styles.commentTimestamp}>
                Dodano: {moment(review.timestamp).format('D. MMMM YYYY. HH:mm:ss')}
              </Text>
              {review.username === currentUser && (
                <View style={styles.commentActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditComment(index)}
                  >
                    <Ionicons name="create" size={20} color="#007BFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteComment(index)}
                  >
                    <Ionicons name="trash" size={20} color="#ff0000" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          {reviews.length > 3 && (
            <TouchableOpacity onPress={toggleShowAllComments}>
              <Text style={[styles.showAllCommentsText, styles.noUnderline]}>
                {showAllComments ? 'Prikaži manje' : 'Prikaži sve komentare'}
              </Text>
            </TouchableOpacity>
          )}
          {editMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.editHeader}>Uređivanje komentara:</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Uredite komentar"
                value={newComment}
                onChangeText={setNewComment}
              />
              <View style={styles.ratingInputContainer}>
                <Text style={styles.ratingInputLabel}>Ocjena:</Text>
                <TextInput
                  style={styles.ratingInput}
                  value={newRating}
                  onChangeText={setNewRating}
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>
              <TouchableOpacity 
                style={styles.addCommentButton}
                onPress={handleAddComment}
              >
                <Text style={styles.addCommentButtonText}>Sačuvaj promjene</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelEditButton}
                onPress={() => {
                  setEditMode(false);
                  setEditIndex(null);
                  setNewComment('');
                  setNewRating('');
                }}
              >
                <Text style={styles.cancelEditButtonText}>Odustani</Text>
              </TouchableOpacity>
            </View>
          )}
          {!editMode && (
            <View style={styles.addCommentContainer}>
              <Text style={styles.currentUserInfo}>
                Komentirate kao: <Text style={styles.currentUserName}>{currentUser}</Text>
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Unesite vaš komentar..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <View style={styles.ratingInputContainer}>
                <Text style={styles.ratingInputLabel}>Ocjena:</Text>
                <TextInput
                  style={styles.ratingInput}
                  value={newRating}
                  onChangeText={setNewRating}
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

        {isAvailable && (
          <View style={styles.calendarContainer}>
            <TouchableOpacity 
              style={styles.reserveButton}
              onPress={() => navigation.navigate('RoomList')}
            >
              <Ionicons name="bed-outline" size={24} color="#fff" />
              <Text style={styles.reserveButtonText}>Pregled soba</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  imageCarousel: {
    marginBottom: 20,
  },
  image: {
    width: Dimensions.get('window').width - 40,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#28a745',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentCount: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  descriptionText: {
    fontSize: 17,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesContainer: {
    marginBottom: 20,
  },
  amenitiesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#666',
  },
  contactContainer: {
    marginBottom: 20,
  },
  contactHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  contactText: {
    fontSize: 16,
    color: '#666',
  },
  availabilityContainer: {
    marginBottom: 20,
  },
  availabilityStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  reservedText: {
    fontSize: 16,
    color: '#666',
  },
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
  },
  addCommentButton: {
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
  calendarContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 12,
    fontWeight: '600',
  },
  currentUserInfo: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  currentUserName: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  guestWarning: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic'
  },
})

export default RoomDetails;