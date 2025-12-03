import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const SignInScreen = ({ navigation, route }) => {
  const { setUser, setIsLoggedIn } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [lastLoggedInEmail, setLastLoggedInEmail] = useState('');

  // Učitaj registrovane korisnike i posljednjeg prijavljenog korisnika iz AsyncStorage-a
  useEffect(() => {
    const loadData = async () => {
      try {
        // Učitaj registrovane korisnike
        const storedUsers = await AsyncStorage.getItem('registeredUsers');
        if (storedUsers) {
          setRegisteredUsers(JSON.parse(storedUsers));
        }
        
        // Učitaj posljednjeg prijavljenog korisnika
        const lastUser = await AsyncStorage.getItem('lastLoggedInUser');
        if (lastUser) {
          const parsedUser = JSON.parse(lastUser);
          setLastLoggedInEmail(parsedUser.email || '');
          
          // Opcionalno: Postavi email u input polje
          if (parsedUser.email) {
            setEmail(parsedUser.email);
          }
        }
      } catch (error) {
        console.error('Greška prilikom učitavanja podataka:', error);
      }
    };

    loadData();
  }, []);

  // Fiksni korisnici za login (isti kao u RegisterScreen)
  const fixedUsers = [
    {
      firstName: 'Alma',
      lastName: 'Bradarić',
      email: 'test1@gmail.com',
      password: 'test1',
    },
    {
      firstName: 'Adnan',
      lastName: 'Hodžić',
      email: 'test2@gmail.com',
      password: 'test2',
    },
    {
      firstName: 'Adna',
      lastName: 'Hasić',
      email: 'test4@gmail.com',
      password: 'test4',
    },
    {
      firstName: 'Amila',
      lastName: 'Lošić',
      email: 'test5@gmail.com',
      password: 'test5',
    },
    {
      firstName: 'Emina',
      lastName: 'Kovačević',
      email: 'test3@gmail.com',
      password: 'test3',
    }
  ];

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Greška', 'Molimo unesite email i lozinku');
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      // 1. Prvo provjeri postojeće korisničke podatke
      const userDataKey = `userData_${normalizedEmail}`;
      const existingUserData = await AsyncStorage.getItem(userDataKey);
      let userData = null;
      
      if (existingUserData) {
        // Korisnik već postoji u AsyncStorage-u, učitaj njegove podatke
        userData = JSON.parse(existingUserData);
        
        // Provjeri lozinku (ili iz postojećih podataka, ili iz fiksnih korisnika)
        const fixedUser = fixedUsers.find(user => 
          user.email.toLowerCase() === normalizedEmail
        );
        
        // Ako korisnik ima sačuvanu lozinku, koristi nju; ako ne, provjeri fiksnu
        const correctPassword = userData.password || (fixedUser ? fixedUser.password : null);
        
        if (password !== correctPassword) {
          Alert.alert('Greška', 'Pogrešna lozinka');
          return;
        }
      } else {
        // Korisnik nije pronađen u AsyncStorage-u, provjeri fiksne korisnike
        const fixedUser = fixedUsers.find(user => 
          user.email.toLowerCase() === normalizedEmail && user.password === password
        );
        
        if (fixedUser) {
          // Kreiraj novog korisnika iz fiksnih podataka
          userData = {
            firstName: fixedUser.firstName,
            lastName: fixedUser.lastName,
            email: fixedUser.email,
            password: fixedUser.password,
            phone: '+385 99 123 4567',
            birthDate: '1990-01-01T00:00:00.000Z',
            profileImage: null,
            isAdmin: false
          };
        } else {
          // Provjeri registrovane korisnike
          const registeredUser = registeredUsers.find(user => 
            user.email.toLowerCase() === normalizedEmail && user.password === password
          );
          
          if (registeredUser) {
            userData = registeredUser;
          } else {
            Alert.alert('Greška', 'Korisnik ne postoji ili je lozinka pogrešna');
            return;
          }
        }
      }
      
      // Pohrani korisničke podatke i zapamti posljednjeg prijavljenog korisnika
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
      await AsyncStorage.setItem(`userData_${userData.email}`, JSON.stringify(userData));
      await AsyncStorage.setItem('lastLoggedInUser', JSON.stringify({email: userData.email}));
      
      if (setUser && setIsLoggedIn) {
        setUser(userData);
        setIsLoggedIn(true);
        navigation.reset({
          index: 0,
          routes: [{ name: 'ProfileScreen' }],
        });
      } else {
        // Ako nema props za postavljanje stanja, samo navigiraj na Main
        navigation.replace('Main', { isAdmin: userData.isAdmin || false });
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom prijave');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} // Ispravljena putanja do logo slike
            style={styles.logo} 
          />
          <Text style={styles.appName}>Stazama BiH</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Prijava</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Lozinka"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Prijavi se</Text>
          </TouchableOpacity>
          
          {/* Testni podaci za prijavu */}
          <View style={styles.testAccounts}>
            <Text style={styles.testAccountsTitle}>Testni nalozi za prijavu:</Text>
            
            <TouchableOpacity 
              style={styles.testAccount} 
              onPress={() => {
                setEmail('test1@gmail.com');
                setPassword('test1');
              }}
            >
              <Text style={styles.testAccountText}>Alma Bradarić - test1@gmail.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testAccount} 
              onPress={() => {
                setEmail('test2@gmail.com');
                setPassword('test2');
              }}
            >
              <Text style={styles.testAccountText}>Adnan Hodžić - test2@gmail.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testAccount} 
              onPress={() => {
                setEmail('test3@gmail.com');
                setPassword('test3');
              }}
            >
              <Text style={styles.testAccountText}>Emina Kovačević - test3@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 15,
    borderRadius: 12,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    alignSelf: 'center',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkText: {
    marginTop: 20,
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
  testAccounts: {
    marginTop: 30,
    alignItems: 'center',
  },
  testAccountsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  testAccount: {
    padding: 5,
  },
  testAccountText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default SignInScreen;