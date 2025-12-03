import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ReservationDetails = ({ route }) => {
  const { startDate, endDate, roomId } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  // Provjera da li je korisnik prijavljen i dohvaćanje podataka o trenutnom korisniku
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setIsLoggedIn(true);
          setCurrentUser(user);
          
          // Popunjavamo polja sa podacima trenutnog korisnika
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    checkLogin();
  }, []);

  // Provjera da li je string prazan ili sadrži samo razmake
  const isStringEmptyOrWhitespace = (str) => {
    return !str || !str.trim();
  };

  const handleConfirmReservation = async () => {
    if (!isLoggedIn) {
      Alert.alert('Greška', 'Morate biti prijavljeni da biste rezervisali sobu.');
      return;
    }

    if (isStringEmptyOrWhitespace(firstName)) {
      Alert.alert('Greška', 'Molimo unesite vaše ime.');
      return;
    }
    if (isStringEmptyOrWhitespace(lastName)) {
      Alert.alert('Greška', 'Molimo unesite vaše prezime.');
      return;
    }
    if (isStringEmptyOrWhitespace(phone)) {
      Alert.alert('Greška', 'Molimo unesite vaš broj telefona.');
      return;
    }
    if (isStringEmptyOrWhitespace(email)) {
      Alert.alert('Greška', 'Molimo unesite vaš email.');
      return;
    }

    // Provjeravamo da li uneseni podaci odgovaraju podacima prijavljenog korisnika
    if (
      firstName.trim() !== currentUser.firstName ||
      lastName.trim() !== currentUser.lastName ||
      email.trim() !== currentUser.email
    ) {
      Alert.alert('Greška', 'Uneseni podaci se ne podudaraju s prijavljenim podacima.');
      return;
    }

    if (paymentMethod === 'online' && (isStringEmptyOrWhitespace(cardNumber) || isStringEmptyOrWhitespace(expiryDate) || isStringEmptyOrWhitespace(cvv) || isStringEmptyOrWhitespace(amount))) {
      Alert.alert('Greška', 'Molimo unesite sve podatke o plaćanju.');
      return;
    }

    setIsLoading(true);

    const start = moment(startDate);
    const end = moment(endDate);
    const allDatesInRange = [];
    while (start.isSameOrBefore(end)) {
      allDatesInRange.push({
        date: start.format('YYYY-MM-DD'),
        status: 'user_reserved',
      });
      start.add(1, 'day');
    }

    const newReservation = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      paymentMethod,
      cardNumber: paymentMethod === 'online' ? cardNumber.trim() : null,
      expiryDate: paymentMethod === 'online' ? expiryDate.trim() : null,
      cvv: paymentMethod === 'online' ? cvv.trim() : null,
      amount: paymentMethod === 'online' ? amount.trim() : null,
      startDate,
      endDate,
      reservationDate: new Date().toISOString(),
      allDatesInRange,
    };

    try {
      const existingReservations = await AsyncStorage.getItem('reservations');
      let reservations = existingReservations ? JSON.parse(existingReservations) : [];
      reservations.push(newReservation);
      await AsyncStorage.setItem('reservations', JSON.stringify(reservations));

      const existingCalendarReservations = await AsyncStorage.getItem('calendar_reservations');
      let calendarReservations = existingCalendarReservations ? JSON.parse(existingCalendarReservations) : [];
      calendarReservations.push(...allDatesInRange);
      await AsyncStorage.setItem('calendar_reservations', JSON.stringify(calendarReservations));

      const formattedStartDate = moment(startDate).format('DD. MMMM YYYY');
      const formattedEndDate = moment(endDate).format('DD. MMMM YYYY');

      setIsLoading(false);
      Alert.alert('Uspjeh', `Vaša rezervacija od ${formattedStartDate} do ${formattedEndDate} je spremljena.`);
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to save reservation', error);
      Alert.alert('Greška', 'Došlo je do greške prilikom spremanja rezervacije.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.whiteBackground}>
      <View style={[styles.container, styles.whiteBackground]}>
        <Text style={styles.title}>Potvrdite svoju rezervaciju</Text>

        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#007BFF" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ime"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="user" size={20} color="#007BFF" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Prezime"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="phone" size={20} color="#007BFF" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Broj telefona"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="envelope" size={20} color="#007BFF" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Način plaćanja:</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('online')}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'online' && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.paymentOptionText}>Online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'in_person' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('in_person')}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'in_person' && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.paymentOptionText}>Uživo</Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'online' && (
          <>
            <Text style={styles.label}>Podaci o plaćanju:</Text>
            <View style={styles.inputContainer}>
              <Icon name="credit-card" size={20} color="#007BFF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Broj kartice"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="calendar" size={20} color="#007BFF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Datum isteka (MM.YYYY)"
                value={expiryDate}
                onChangeText={setExpiryDate}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#007BFF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Sigurnosni kod (CVV)"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="money" size={20} color="#007BFF" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Iznos za uplatu: 000,00 (BAM)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="bank" size={20} color="#007BFF" style={styles.icon} />
              <View style={styles.bankInfoTextContainer}>
                <Text style={styles.bankInfo}>
                  Broj računa: <Text style={styles.bankInfoBold}>123-456789-00</Text>
                </Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color="#007BFF" style={styles.icon} />
              <View style={styles.bankInfoTextContainer}>
                <Text style={styles.bankInfo}>
                  Primalac: <Text style={styles.bankInfoBold}>Stazama BiH</Text>
                </Text>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirmReservation}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Potvrdi rezervaciju</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  whiteBackground: {
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 50, // Fiksna visina za sve prozore
    justifyContent: 'center', // Centriramo tekst vertikalno
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16, // Osiguravamo da je font veličine konzistentan
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  paymentOptions: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paymentOptionSelected: {
    borderColor: '#007BFF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007BFF',
  },
  paymentOptionText: {
    color: '#000',
  },
  bankInfoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  bankInfo: {
    fontSize: 16, // Osiguravamo da je font veličine konzistentan
  },
  bankInfoBold: {
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReservationDetails;