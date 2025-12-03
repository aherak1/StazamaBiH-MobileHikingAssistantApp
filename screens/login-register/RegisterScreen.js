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
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Fiksni korisnici za registraciju
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

  // Učitaj registrovane korisnike iz AsyncStorage-a
  useEffect(() => {
    const loadRegisteredUsers = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem('registeredUsers');
        if (storedUsers) {
          setRegisteredUsers(JSON.parse(storedUsers));
        }
      } catch (error) {
        console.error('Greška prilikom učitavanja korisnika:', error);
      }
    };

    loadRegisteredUsers();
  }, []);

  const handleRegister = async () => {
    // Normalizirajte unos (uklonite razmake i pretvorite u mala slova)
    const normalizedName = name.trim();
    const normalizedSurname = surname.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Provjerite da li su sva polja popunjena
    if (!normalizedName || !normalizedSurname || !normalizedEmail || !normalizedPassword) {
      Alert.alert('Greška', 'Sva polja su obavezna', [{ text: 'OK' }]);
      return;
    }

    // Provjerite da li je email validan
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert('Greška', 'Unesite validan email', [{ text: 'OK' }]);
      return;
    }

    // Provjerite da li se podaci podudaraju sa nekim fiksnim korisnikom
    const matchedUser = fixedUsers.find(user => 
      normalizedEmail === user.email.toLowerCase() &&
      normalizedPassword === user.password &&
      normalizedName.toLowerCase() === user.firstName.toLowerCase() &&
      normalizedSurname.toLowerCase() === user.lastName.toLowerCase()
    );

    if (matchedUser) {
      // Korisnik se podudara sa fiksnim korisnikom
      const userData = {
        firstName: normalizedName,
        lastName: normalizedSurname,
        email: normalizedEmail,
        password: normalizedPassword,
        isAdmin: false
      };

      // Provjerite da li korisnik već postoji u registrovanim korisnicima
      const existingUser = registeredUsers.find(user => user.email.toLowerCase() === normalizedEmail);
      
      if (!existingUser) {
        try {
          // Dodajte korisnika u listu registrovanih korisnika
          const updatedUsers = [...registeredUsers, userData];
          await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
          
          // Postavite trenutnog korisnika
          await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
          
          Alert.alert('Uspjeh', 'Uspješno ste registrovani!', [
            { text: 'OK', onPress: () => navigation.replace('Main', { isAdmin: false }) },
          ]);
        } catch (error) {
          Alert.alert('Greška', 'Došlo je do greške prilikom pohrane podataka.', [{ text: 'OK' }]);
        }
      } else {
        Alert.alert('Greška', 'Korisnik sa ovim email-om već postoji.', [{ text: 'OK' }]);
      }
    } else {
      // Korisnik se ne podudara ni sa jednim fiksnim korisnikom
      Alert.alert('Greška', 'Neispravni podaci za registraciju. Molimo provjerite svoje podatke.', [{ text: 'OK' }]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.appName}>Stazama BiH</Text>
        </View>

        <View style={styles.innerContainer}>
          <Text style={styles.title}>Registracija</Text>

          <TextInput
            style={styles.input}
            placeholder="Ime"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Prezime"
            placeholderTextColor="#999"
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
          />

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

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registruj se</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Već imaš račun? Prijavi se</Text>
          </TouchableOpacity>
          
          {/* Testni podaci za registraciju */}
          <View style={styles.testAccounts}>
            <Text style={styles.testAccountsTitle}>Testni nalozi za registraciju:</Text>
            
            <TouchableOpacity 
              style={styles.testAccount} 
              onPress={() => {
                setName('Alma');
                setSurname('Bradarić');
                setEmail('test1@gmail.com');
                setPassword('test1');
              }}
            >
              <Text style={styles.testAccountText}>Alma Bradarić</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testAccount} 
              onPress={() => {
                setName('Adnan');
                setSurname('Hodžić');
                setEmail('test2@gmail.com');
                setPassword('test2');
              }}
            >
              <Text style={styles.testAccountText}>Adnan Hodžić</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testAccount} 
              onPress={() => {
                setName('Emina');
                setSurname('Kovačević');
                setEmail('test3@gmail.com');
                setPassword('test3');
              }}
            >
              <Text style={styles.testAccountText}>Emina Kovačević</Text>
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
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#007AFF',
    fontSize: 16,
  },
  testAccounts: {
    marginTop: 20,
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

export default RegisterScreen;