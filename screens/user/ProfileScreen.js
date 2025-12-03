import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
  primary: '#007BFF',
  danger: '#f44336',
  background: '#f5f5f5',
  textPrimary: '#333',
  textSecondary: '#666',
  white: '#fff',
};

const ProfileScreen = ({ navigation }) => {
  const defaultUser = {
    firstName: 'Gost',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    profileImage: null,
  };

  const [user, setUser] = useState(defaultUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      id: '1',
      title: 'Osnovne informacije o korisniku',
      icon: 'person',
      onPress: () => navigation.navigate('UserInfoScreen', { user, setUser }),
    },
    {
      id: '2',
      title: 'Postavke aplikacije',
      icon: 'settings',
      onPress: () => navigation.navigate('SettingsScreen'),
    },
    {
      id: '3',
      title: 'Personalizacija',
      icon: 'style',
      onPress: () => navigation.navigate('PersonalizationScreen'),
    },
    {
      id: '4',
      title: 'Kontakt podrška',
      icon: 'support-agent',
      onPress: () => navigation.navigate('SupportScreen'),
    },
    {
      id: '5',
      title: 'O nama',
      icon: 'info',
      onPress: () => navigation.navigate('AboutScreen'),
    },
    {
      id: '6',
      title: 'Statistika i povijest',
      icon: 'timeline',
      onPress: () => navigation.navigate('StatisticsScreen'),
    },
  ];

  // Funkcija za ažuriranje lastActive vremena
  const updateLastActive = async (userEmail) => {
    try {
      const userSpecificKey = `userData_${userEmail}`;
      const userData = await AsyncStorage.getItem(userSpecificKey);
      
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        const updatedUserData = {
          ...parsedUserData,
          lastActive: new Date().toISOString(), // Trenutno vrijeme
        };
        
        // Spremi ažurirane podatke
        await AsyncStorage.setItem(userSpecificKey, JSON.stringify(updatedUserData));
        console.log(`LastActive ažuriran za korisnika: ${userEmail}`);
      }
    } catch (error) {
      console.error('Greška pri ažuriranju lastActive:', error);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Prvo učitamo trenutno prijavljenog korisnika
        const currentUserData = await AsyncStorage.getItem('currentUser');
        if (currentUserData) {
          const parsedUserData = JSON.parse(currentUserData);
          const userEmail = parsedUserData.email;
          
          // VAŽNO: Ažuriramo lastActive kad se korisnik učita (što znači da je aktivan)
          await updateLastActive(userEmail);
          
          // Pokušajmo učitati dodatne podatke specifične za korisnika
          const userSpecificKey = `userData_${userEmail}`;
          const userData = await AsyncStorage.getItem(userSpecificKey);
          
          if (userData) {
            // Spojimo podatke, s prioritetom na userData za profilne detalje
            const parsedAdditionalData = JSON.parse(userData);
            setUser({
              ...parsedUserData,
              ...parsedAdditionalData,
              // Osiguramo da ova polja postoje
              phone: parsedAdditionalData.phone || parsedUserData.phone || '',
              birthDate: parsedAdditionalData.birthDate || parsedUserData.birthDate || new Date().toISOString(),
              profileImage: parsedAdditionalData.profileImage || parsedUserData.profileImage || null,
              // Dodajemo trenutno vrijeme kao lastActive
              lastActive: new Date().toISOString(),
            });
          } else {
            // Ako imamo samo podatke za prijavu ali ne i profilne podatke
            const userWithActivity = {
              ...parsedUserData,
              phone: parsedUserData.phone || '',
              birthDate: parsedUserData.birthDate || new Date().toISOString(),
              profileImage: parsedUserData.profileImage || null,
              lastActive: new Date().toISOString(),
            };
            
            setUser(userWithActivity);
            
            // Spremi u novi format s ažuriranim lastActive
            await AsyncStorage.setItem(userSpecificKey, JSON.stringify(userWithActivity));
          }
          setIsLoggedIn(true);
        } else {
          setUser(defaultUser);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Greška pri učitavanju podataka:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    
    // Dodamo listener za osvježavanje podataka pri povratku na ovaj ekran
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const getInitials = () => {
    const first = user.firstName?.[0]?.toUpperCase() || '';
    const last = user.lastName?.[0]?.toUpperCase() || '';
    return `${first}${last}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Odjava',
      'Jeste li sigurni da se želite odjaviti?',
      [
        { text: 'Otkaži', style: 'cancel' },
        {
          text: 'Odjava',
          style: 'destructive',
          onPress: async () => {
            try {
              // Prije odjave, ažuriraj lastActive za zadnji put
              if (user.email) {
                await updateLastActive(user.email);
              }
              
              // Uklonimo samo currentUser
              await AsyncStorage.removeItem('currentUser');
              setUser(defaultUser);
              setIsLoggedIn(false);
              Alert.alert('Odjava', 'Uspješno ste odjavljeni.');
            } catch (error) {
              console.error('Greška pri odjavi:', error);
            }
          },
        },
      ]
    );
  };

  const renderProfileImage = () => {
    if (user.profileImage) {
      return (
        <Image 
          source={{ uri: user.profileImage }} 
          style={styles.profileImage}
          onError={() => setUser({ ...user, profileImage: null })}
        />
      );
    }
    return (
      <View style={styles.initialsContainer}>
        <Text style={styles.initialsText}>{getInitials()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {renderProfileImage()}
        <Text style={styles.name}>
          {isLoggedIn ? `${user.firstName} ${user.lastName}` : 'Gost'}
        </Text>
        {isLoggedIn && <Text style={styles.email}>{user.email}</Text>}
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name={item.icon} size={24} color={colors.textPrimary} />
            <Text style={styles.menuItemText}>{item.title}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
        
        {isLoggedIn && (
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={24} color={colors.danger} />
            <Text style={[styles.menuItemText, { color: colors.danger }]}>Odjava</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isLoggedIn && (
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('SignInScreen', { setUser, setIsLoggedIn })}
          activeOpacity={0.7}
        >
          <Text style={styles.loginButtonText}>Prijava </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  initialsContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialsText: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  menuSection: {
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: colors.textPrimary,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  loginButton: {
    marginHorizontal: 40,
    marginTop: 40,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;