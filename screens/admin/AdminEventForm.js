// screens/Admin/AdminEventForm.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import EventService from './EventService';
import ImageStorageService from './ImageStorageService'; // Dodano

const AdminEventForm = ({ navigation, route }) => {
  // Provjera je li uređivanje postojećeg događaja
  const isEditing = route.params?.isEditing || false;
  const eventToEdit = route.params?.event || null;

  // Početne vrijednosti
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [detailedDescription, setDetailedDescription] = useState(eventToEdit?.detailedDescription || '');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [eventDate, setEventDate] = useState(eventToEdit ? new Date(eventToEdit.eventDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [images, setImages] = useState(eventToEdit?.images || []);
  const [saving, setSaving] = useState(false); // Dodano za indikator učitavanja
  
  // Funkcija za formatiranje datuma
  const formatDate = (date) => {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}.`;
  };

  // Funkcija za upravljanje promjenom datuma
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || eventDate;
    setShowDatePicker(Platform.OS === 'ios');
    setEventDate(currentDate);
  };

  // Funkcija za odabir slike iz galerije
  const pickImage = async () => {
    // Tražimo dopuštenje za pristup galeriji
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Potrebna dozvola', 'Potrebno je odobrenje za pristup galeriji slika');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Dodajemo novu sliku u niz slika, ograničavamo na maksimalno 4 slike
      if (images.length < 4) {
        setImages([...images, result.assets[0].uri]);
      } else {
        Alert.alert('Upozorenje', 'Možete dodati najviše 4 slike.');
      }
    }
  };

  // Funkcija za fotografiranje
  const takePhoto = async () => {
    // Tražimo dopuštenje za pristup kameri
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Potrebna dozvola', 'Potrebno je odobrenje za pristup kameri');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Dodajemo novu sliku u niz slika, ograničavamo na maksimalno 4 slike
      if (images.length < 4) {
        setImages([...images, result.assets[0].uri]);
      } else {
        Alert.alert('Upozorenje', 'Možete dodati najviše 4 slike.');
      }
    }
  };

  // Funkcija za uklanjanje slike
  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // Funkcija za renderiranje pojedinačne slike
  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageItemContainer}>
      <Image 
        source={{ uri: item }} 
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
      <TouchableOpacity 
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <Feather name="x" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );

  // Funkcija za spremanje ili ažuriranje događaja
  const saveEvent = async () => {
    // Provjera obaveznih polja
    if (!title || !description || !location) {
      Alert.alert('Greška', 'Molimo popunite sva obavezna polja');
      return;
    }

    setSaving(true);

    try {
      // Generiraj privremeni ID za novi događaj
      const eventId = isEditing && eventToEdit ? eventToEdit.id : 'temp_' + Date.now();
      
      // Spremi slike u trajni direktorij
      let savedImages = [];
      if (images.length > 0) {
        savedImages = await ImageStorageService.saveEventImages(images, eventId);
      } else {
        savedImages = ['https://via.placeholder.com/300x200?text=Stazama+BiH'];
      }

      const eventData = {
        title,
        description,
        detailedDescription,
        location,
        eventDate: eventDate.toISOString(),
        images: savedImages,
      };

      let success;
      let finalEventId = eventId;
      
      if (isEditing && eventToEdit) {
        // Ažuriranje postojećeg događaja
        success = await EventService.updateEvent(eventToEdit.id, eventData);
        finalEventId = eventToEdit.id;
      } else {
        // Kreiranje novog događaja
        const result = await EventService.addEvent(eventData);
        success = result.success;
        if (success && result.eventId) {
          finalEventId = result.eventId;
          
          // Ako je kreiran novi događaj s novim ID-om, ažuriraj slike
          if (finalEventId !== eventId) {
            const updatedImages = await ImageStorageService.saveEventImages(savedImages, finalEventId);
            await EventService.updateEvent(finalEventId, { ...eventData, images: updatedImages });
          }
        }
      }
      
      if (success) {
        Alert.alert(
          'Uspjeh',
          isEditing ? 'Događaj je uspješno ažuriran' : 'Događaj je uspješno kreiran',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Greška', 'Došlo je do greške prilikom spremanja događaja');
      }
      
    } catch (error) {
      console.error('Greška pri spremanju događaja:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja događaja');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Uredi događaj' : 'Kreiranje novog događaja'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Naziv događaja*</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Unesite naziv događaja"
          editable={!saving}
        />

        <Text style={styles.label}>Kratak opis*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Unesite kratak opis događaja"
          multiline
          numberOfLines={4}
          editable={!saving}
        />

        <Text style={styles.label}>Detaljni opis</Text>
        <TextInput
          style={[styles.input, styles.detailedTextArea]}
          value={detailedDescription}
          onChangeText={setDetailedDescription}
          placeholder="Unesite detaljan opis događaja, rute, informacije o stazi, itd."
          multiline
          numberOfLines={8}
          editable={!saving}
        />

        <Text style={styles.label}>Lokacija*</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Unesite lokaciju događaja"
          editable={!saving}
        />

        <Text style={styles.label}>Datum događaja</Text>
        <TouchableOpacity
          style={[styles.datePickerButton, saving && styles.disabledInput]}
          onPress={() => !saving && setShowDatePicker(true)}
          disabled={saving}
        >
          <Text style={styles.datePickerText}>{formatDate(eventDate)}</Text>
          <Feather name="calendar" size={20} color="#007AFF" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={isEditing ? undefined : new Date()}
          />
        )}

        <Text style={styles.label}>Slike (max 4)</Text>
        <Text style={styles.imageHint}>Dodajte do 4 slike koje će se prikazivati kao galerija</Text>
        
        {images.length > 0 && (
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageList}
          />
        )}

        <View style={styles.imageCounterContainer}>
          <Text style={styles.imageCounter}>{images.length}/4 slika</Text>
        </View>

        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.imageButton, 
              (images.length >= 4 || saving) && styles.disabledButton
            ]} 
            onPress={pickImage}
            disabled={images.length >= 4 || saving}
          >
            <Feather name="image" size={20} color="white" />
            <Text style={styles.imageButtonText}>Odaberi iz galerije</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.imageButton, 
              (images.length >= 4 || saving) && styles.disabledButton
            ]} 
            onPress={takePhoto}
            disabled={images.length >= 4 || saving}
          >
            <Feather name="camera" size={20} color="white" />
            <Text style={styles.imageButtonText}>Fotografiraj</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={saveEvent}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving 
              ? 'Spremanje...' 
              : (isEditing ? 'Spremi promjene' : 'Kreiraj događaj')
            }
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            style={[styles.cancelButton, saving && styles.disabledButton]}
            onPress={() => !saving && navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Odustani</Text>
          </TouchableOpacity>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  detailedTextArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  imageHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  imageList: {
    flexGrow: 0,
    marginBottom: 15,
  },
  imageItemContainer: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounterContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  imageCounter: {
    fontSize: 14,
    color: '#666',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  disabledInput: {
    opacity: 0.6,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  }
});

export default AdminEventForm;