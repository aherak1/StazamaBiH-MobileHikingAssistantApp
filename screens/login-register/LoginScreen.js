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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Definisanje default korisnika (u praksi bi ovo bilo u bazi podataka)
  const defaultUsers = [
    {
      email: 'test1@gmail.com',
      password: 'test1',
      firstName: 'Alma',
      lastName: 'Bradarić',
      isAdmin: false
    },
    {
      email: 'test2@gmail.com',
      password: 'test2',
      firstName: 'Adnan',
      lastName: 'Hodžić',
      isAdmin: false
    },
    {
      email: 'test3@gmail.com',
      password: 'test3',
      firstName: 'Emina',
      lastName: 'Kovačević',
      isAdmin: false
    },
    {
      email: 'admin@stazamabh.com',
      password: 'admin123',
      firstName: 'Administrator',
      lastName: '',
      isAdmin: true
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

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    // Prvo provjeri default korisnike
    const defaultUser = defaultUsers.find(u => 
      u.email.toLowerCase() === normalizedEmail && 
      u.password === normalizedPassword
    );

    // Zatim provjeri registrovane korisnike (ako ih ima)
    const registeredUser = registeredUsers.find(u => 
      u.email.toLowerCase() === normalizedEmail && 
      u.password === normalizedPassword
    );

    const user = defaultUser || registeredUser;

    if (user) {
      console.log('Prijava uspješna, korisnik je admin:', user.isAdmin);
      
      // Spremi trenutno logovanog korisnika
      try {
        await AsyncStorage.setItem('currentUser', JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isAdmin: user.isAdmin
        }));
      } catch (error) {
        console.error('Greška prilikom spremanja trenutnog korisnika:', error);
      }
      
      // Prikaži poruku o uspješnoj prijavi
      Alert.alert(
        'Uspješna prijava', 
        `Dobrodošli ${user.isAdmin ? 'administratore' : user.firstName}! Uspješno ste prijavljeni.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Nakon zatvaranja poruke, preusmjeri korisnika
              if (user.isAdmin) {
                // Preusmjeri na AdminStack za administratore
                navigation.replace('AdminStack');
              } else {
                // Preusmjeri na Main za obične korisnike, proslijedi isAdmin=false
                navigation.replace('Main', { isAdmin: false });
              }
            }
          }
        ]
      );
    } else {
      Alert.alert('Greška', 'Pogrešan email ili šifra', [{ text: 'OK' }]);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.appName}>Stazama BiH</Text>
      </View>

      <View style={styles.innerContainer}>
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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Prijavi se</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Nemaš račun? Registruj se</Text>
        </TouchableOpacity>
        
        {/* Testni podaci za korisnike */}
        <View style={styles.testAccounts}>
          <Text style={styles.testAccountsTitle}>Testni nalozi:</Text>
          
          <TouchableOpacity 
            style={styles.testAccount} 
            onPress={() => {
              setEmail('test1@gmail.com');
              setPassword('test1');
            }}
          >
            <Text style={styles.testAccountText}>Alma Bradarić</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.testAccount} 
            onPress={() => {
              setEmail('test2@gmail.com');
              setPassword('test2');
            }}
          >
            <Text style={styles.testAccountText}>Adnan Hodžić</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.testAccount} 
            onPress={() => {
              setEmail('test3@gmail.com');
              setPassword('test3');
            }}
          >
            <Text style={styles.testAccountText}>Emina Kovačević</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.adminHint} 
            onPress={() => {
              setEmail('admin@stazamabh.com');
              setPassword('admin123');
            }}
          >
            <Text style={styles.adminHintText}>Admin prijava</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  adminHint: {
    marginTop: 5,
    padding: 5,
  },
  adminHintText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
});

export default LoginScreen;