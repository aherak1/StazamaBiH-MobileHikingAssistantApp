import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

const RoomDetails = ({ route }) => {
  const { room } = route.params;
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const onDateChange = (date, type) => {
    if (type === 'START_DATE') {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      setSelectedEndDate(date);
    }
  };

  const handleReservation = () => {
    // Logika za rezervaciju sobe
  };

  return (
    <View style={styles.container}>
      <Image source={room.image} style={styles.roomImage} />
      <View style={styles.roomDetails}>
        <Text style={styles.roomName}>{room.name}</Text>
        <Text style={styles.roomCapacity}>Kapacitet: {room.capacity} osobe</Text>
        <Text style={styles.roomStatus}>Status: {room.status}</Text>
      </View>
      <CalendarPicker
        startFromMonday={true}
        allowRangeSelection={true}
        minDate={new Date()}
        onDateChange={onDateChange}
      />
      <View style={styles.selectedDates}>
        <Text>Početni datum: {selectedStartDate ? selectedStartDate.toString() : ''}</Text>
        <Text>Krajnji datum: {selectedEndDate ? selectedEndDate.toString() : ''}</Text>
      </View>
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={handleReservation}
      >
        <Text style={styles.reserveButtonText}>Rezerviši</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  roomImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  roomDetails: {
    marginBottom: 16,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roomCapacity: {
    fontSize: 18,
    marginBottom: 8,
  },
  roomStatus: {
    fontSize: 18,
    marginBottom: 16,
  },
  selectedDates: {
    marginBottom: 16,
  },
  reserveButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default RoomDetails;