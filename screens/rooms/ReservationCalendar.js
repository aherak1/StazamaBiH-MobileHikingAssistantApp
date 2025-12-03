import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import 'moment/locale/bs'; // Import bosnian locale
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Dodajemo ikone

const ReservationCalendar = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const accommodation = route?.params?.accommodation || {};
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [availabilityDates, setAvailabilityDates] = useState([]);

  useEffect(() => {
    if (isFocused) {
      loadInitialReservedDates();
      loadReservations();
    }
  }, [isFocused]);

  const loadInitialReservedDates = () => {
    let markedDates = [];

    // Mark dates from 17 to 22 March 2025 as reserved (red)
    let startDate = new Date('2025-06-17');
    let endDate = new Date('2025-06-22');
    while (startDate <= endDate) {
      const dateString = startDate.toISOString().split('T')[0];
      markedDates.push({ date: dateString, status: 'reserved' });
      startDate.setDate(startDate.getDate() + 1);
    }

    setAvailabilityDates(markedDates);
  };

  const loadReservations = async () => {
    try {
      const existingCalendarReservations = await AsyncStorage.getItem('calendar_reservations');
      if (existingCalendarReservations) {
        const parsedReservations = JSON.parse(existingCalendarReservations);
        setAvailabilityDates(prevDates => [...prevDates, ...parsedReservations]);
      }
    } catch (error) {
      console.error('Failed to load reservations', error);
    }
  };

  const onDateChange = (date, type) => {
    if (type === 'START_DATE') {
      setSelectedStartDate(moment(date));
      setSelectedEndDate(null);
    } else {
      setSelectedEndDate(moment(date));
    }
  };

  const handleReserve = () => {
    if (!selectedStartDate || !selectedEndDate) {
      Alert.alert('Greška', 'Molimo odaberite datume dolaska i odlaska.');
      return;
    }

    const startDate = selectedStartDate.format('YYYY-MM-DD');
    const endDate = selectedEndDate.format('YYYY-MM-DD');

    const unavailableDates = availabilityDates
      .filter(date => date.status === 'reserved' || date.status === 'user_reserved')
      .map(date => date.date);

    if (unavailableDates.includes(startDate) || unavailableDates.includes(endDate)) {
      Alert.alert('Nedostupno', 'Odabrani datumi nisu dostupni.');
      return;
    }

    navigation.navigate('ReservationDetails', {
      startDate,
      endDate,
      roomId: accommodation.id,
    });
  };

  const handleReset = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleDeleteReservations = async () => {
    Alert.alert(
      'Obriši rezervacije',
      'Da li ste sigurni da želite obrisati sve vaše rezervisane termine?',
      [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Obriši', onPress: async () => {
          try {
            const fixedReservations = availabilityDates.filter(date => date.status === 'reserved');
            setAvailabilityDates(fixedReservations);
            await AsyncStorage.removeItem('calendar_reservations');
            Alert.alert('Uspjeh', 'Sve vaše rezervacije su obrisane.');
          } catch (error) {
            console.error('Failed to delete reservations', error);
            Alert.alert('Greška', 'Došlo je do greške prilikom brisanja rezervacija.');
          }
        }},
      ]
    );
  };

  const customDatesStyles = date => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const availability = availabilityDates.find(d => d.date === formattedDate);
    if (availability) {
      return {
        style: {
          backgroundColor: availability.status === 'reserved' ? '#dc3545' : (availability.status === 'user_reserved' ? '#17a2b8' : undefined),
        },
        textStyle: {
          color: availability.status === 'reserved' || availability.status === 'user_reserved' ? 'white' : 'black', // Dodaj defaultnu boju
        },
      };
    }
    return {
      textStyle: {
        color: 'black', // Dodaj defaultnu boju
      },
    };
  };

  // Custom komponente za strelice
  const PreviousComponent = () => (
    <View style={styles.navButtonContainer}>
      <Text style={styles.navButtonText}>Prethodni</Text>
    </View>
  );

  const NextComponent = () => (
    <View style={styles.navButtonContainer}>
      <Text style={styles.navButtonText}>Sljedeći</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rezervišite termin</Text>
      <CalendarPicker
        startFromMonday={true}
        allowRangeSelection={true}
        minDate={new Date()}
        onDateChange={onDateChange}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
        todayBackgroundColor="#f2e6ff"
        selectedDayColor="#007BFF" // Plava boja za odabrane termine
        selectedDayTextColor="#FFFFFF"
        customDatesStyles={customDatesStyles}
        months={[
          'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
          'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
        ]}
        weekdays={['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']}
        previousComponent={<PreviousComponent />} // Custom komponenta za "Prethodni"
        nextComponent={<NextComponent />} // Custom komponenta za "Sljedeći"
        textStyle={styles.calendarText} // Stil za tekst u kalendaru
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.reserveButton]} 
          onPress={handleReserve}
        >
          <Icon name="calendar" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Rezerviši</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={handleReset}
        >
          <Icon name="refresh" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Resetuj</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={handleDeleteReservations}
        >
          <Icon name="trash" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Obriši</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007BFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    width: '35%',
  },
  reserveButton: {
    backgroundColor: '#007BFF',
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginLeft: 0,
  },
  calendarText: {
    textAlign: 'right',
  },
  navButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10, // Dodajemo padding za bolji izgled
  },
  navButtonText: {
    fontSize: 16,
    color: '#007BFF', // Boja teksta
  },
});

export default ReservationCalendar;