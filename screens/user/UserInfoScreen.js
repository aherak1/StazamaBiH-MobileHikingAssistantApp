import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const colors = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#4299E1',
  danger: '#DC3545',
  background: '#F7FAFC',
  border: '#E2E8F0',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
};

const UserInfoScreen = ({ route, navigation }) => {
  const { user, setUser } = route.params;
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [birthDate, setBirthDate] = useState(
    user.birthDate ? new Date(user.birthDate) : new Date(1990, 0, 1)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(user.profileImage || null);
  const [isCurrentUser, setIsCurrentUser] = useState(true);

  // Check if this user is the currently logged-in user
  useEffect(() => {
    const verifyCurrentUser = async () => {
      try {
        const currentUserData = await AsyncStorage.getItem('currentUser');
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);
          // Check if email matches to verify it's the same user
          setIsCurrentUser(currentUser.email === email);
        }
      } catch (error) {
        console.error('Error verifying current user:', error);
      }
    };
    
    verifyCurrentUser();
  }, [email]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Dozvola za pristup galeriji je potrebna!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const renderProfileImage = () => {
    if (profileImage) {
      return (
        <View style={styles.imageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <View style={styles.imageOverlay}>
            <MaterialIcons name="edit" size={24} color="white" />
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>
            {getInitials(firstName, lastName)}
          </Text>
          <MaterialIcons 
            name="add-a-photo" 
            size={24} 
            style={styles.addPhotoIcon} 
          />
        </View>
      );
    }
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const handleSave = async () => {
    const updatedUser = {
      firstName,
      lastName,
      email,
      phone,
      birthDate: birthDate.toISOString(),
      profileImage,
    };

    try {
      // Za pohranu korisničkih podataka koristimo ključ koji je specifičan za korisnika
      // umjesto zajedničkog "userData" ključa za sve korisnike
      const userSpecificKey = `userData_${email}`;
      await AsyncStorage.setItem(userSpecificKey, JSON.stringify(updatedUser));
      
      // Ako je ovo trenutno prijavljeni korisnik, također ažuriramo currentUser
      if (isCurrentUser) {
        const currentUserData = await AsyncStorage.getItem('currentUser');
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);
          const updatedCurrentUser = {
            ...currentUser,
            firstName,
            lastName,
            email,
            profileImage,
            // Ne prepisivati isAdmin svojstvo ako postoji
            isAdmin: currentUser.isAdmin !== undefined ? currentUser.isAdmin : false
          };
          await AsyncStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        }
      }
      
      // Ažuriramo stanje u roditeljskoj komponenti
      setUser(updatedUser);
      Alert.alert('Informacije', 'Vaše informacije su uspješno sačuvane.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja podataka.');
      console.error('Error saving user data:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  const deleteProfileImage = () => {
    Alert.alert(
      'Brisanje profilne slike',
      'Jeste li sigurni da želite obrisati profilnu sliku?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          onPress: async () => {
            try {
              setProfileImage(null);
              const updatedUser = { ...user, profileImage: null };
              
              // Ažuriramo obje lokacije za pohranu
              const userSpecificKey = `userData_${email}`;
              await AsyncStorage.setItem(userSpecificKey, JSON.stringify(updatedUser));
              
              if (isCurrentUser) {
                const currentUserData = await AsyncStorage.getItem('currentUser');
                if (currentUserData) {
                  const currentUser = JSON.parse(currentUserData);
                  const updatedCurrentUser = {
                    ...currentUser,
                    profileImage: null
                  };
                  await AsyncStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
                }
              }
              
              setUser(updatedUser);
            } catch (error) {
              Alert.alert('Greška', 'Došlo je do greške prilikom brisanja');
              console.error('Error deleting profile image:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formattedDate = format(birthDate, 'dd. MMMM yyyy.', { locale: bs });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          {renderProfileImage()}
        </TouchableOpacity>

        {profileImage && (
          <TouchableOpacity 
            onPress={deleteProfileImage} 
            style={styles.deleteButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete" size={20} color={colors.danger} />
            <Text style={styles.deleteButtonText}>Obriši sliku</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ime</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Unesite ime"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prezime</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Unesite prezime"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Datum rođenja</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)} 
            style={styles.dateInput}
            activeOpacity={0.8}
          >
            <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              themeVariant="light"
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@primjer.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isCurrentUser} // Email should be read-only for current user
          />
          {isCurrentUser && (
            <Text style={styles.emailNote}>Email ne može biti promijenjen za trenutno prijavljenog korisnika.</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Broj telefona</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+387 6X XXX XXX"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Sačuvaj promjene</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.background,
  },
  imageButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 100,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  initialsText: {
    fontSize: 48,
    fontWeight: '300',
    color: 'white',
    letterSpacing: 2,
  },
  addPhotoIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    padding: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  deleteButtonText: {
    color: colors.danger,
    marginLeft: 5,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emailNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 5,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 16,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

UserInfoScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      user: PropTypes.object.isRequired,
      setUser: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserInfoScreen;