import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/bs';

// Ručno postavljene skraćenice za mjesece
moment.updateLocale('sr', {
  months: [
    'januar', 'februar', 'mart', 'april', 'maj', 'jun',
    'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
  ],
  monthsShort: [
    'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
    'jul', 'avg', 'sep', 'okt', 'nov', 'dec'
  ]
});

// Koristimo isti sistem boja kao i na drugim screenovima
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

const MyReservations = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser({
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`
          });
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju korisnika:', error);
        setError('Došlo je do greške pri dohvaćanju korisnika');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Učitaj rezervacije samo kad imamo identitet korisnika
    if (currentUser) {
      loadReservations();
    }
  }, [currentUser]);

  // Dodano praćenje osvježavanja ekrana
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentUser) {
        loadReservations();
      }
    });

    return unsubscribe;
  }, [navigation, currentUser]);

  const loadReservations = async () => {
    try {
      const existingReservations = await AsyncStorage.getItem('reservations');
      const allReservations = existingReservations ? JSON.parse(existingReservations) : [];
      
      // Filtriraj rezervacije samo za trenutnog korisnika
      const userReservations = allReservations.filter(
        res => res.firstName === currentUser.firstName && res.lastName === currentUser.lastName
      );
      
      setReservations(userReservations);
      setError(null);
    } catch (error) {
      setError('Greška pri učitavanju rezervacija');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservations = () => {
    Alert.alert(
      'Brisanje rezervacija',
      'Jeste li sigurni da želite obrisati sve svoje rezervacije?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: async () => {
            try {
              // Dohvati sve rezervacije
              const existingReservations = await AsyncStorage.getItem('reservations');
              const allReservations = existingReservations ? JSON.parse(existingReservations) : [];
              
              // Filtriraj tako da ostanu samo rezervacije drugih korisnika
              const filteredReservations = allReservations.filter(
                res => !(res.firstName === currentUser.firstName && res.lastName === currentUser.lastName)
              );
              
              // Spremi filtrirane rezervacije nazad
              await AsyncStorage.setItem('reservations', JSON.stringify(filteredReservations));
              
              // Ažuriraj prikaz
              setReservations([]);
              Alert.alert('Uspjeh', 'Sve vaše rezervacije su obrisane');
            } catch (error) {
              setError('Greška pri brisanju');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const renderReservationCard = (reservation, index) => (
    <View key={index} style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="calendar-today" size={18} color={colors.accent} />
        <Text style={styles.reservationTitle}>Rezervacija #{index + 1}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="person" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          {reservation.firstName} {reservation.lastName}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="date-range" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          {moment(reservation.startDate).format('DD. MMMM')} -{' '}
          {moment(reservation.endDate).format('DD. MMMM YYYY')}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          Rezervisano: {moment(reservation.reservationDate).format('DD. MMMM YYYY HH:mm')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={40} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Ako nemamo korisnika, prikaži poruku za prijavu
  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="person-off" size={40} color={colors.textSecondary} />
        <Text style={styles.errorText}>Molimo prijavite se da biste vidjeli svoje rezervacije</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          <Text style={styles.loginButtonText}>Prijava</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {reservations.length > 0 ? (
          reservations.map(renderReservationCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Trenutno nema aktivnih rezervacija</Text>
          </View>
        )}
      </ScrollView>

      {reservations.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleDeleteReservations}
          activeOpacity={0.8}
          accessibilityLabel="Obriši sve rezervacije"
        >
          <MaterialIcons name="delete-forever" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  reservationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  reservationTitle: {
    fontSize: 17, // Povećano sa 16
    fontWeight: '700', // Podebljano
    color: colors.accent, // Boja kao ikonica
    marginLeft: 8,
    letterSpacing: -0.3, // Bolja čitljivost
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoText: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '500', // Podebljano
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.danger,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  boldLabel: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default MyReservations;