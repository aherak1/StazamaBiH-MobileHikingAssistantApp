import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Podaci o sobama
const roomsData = [
  { id: '1', name: 'Soba 1', beds: 1, children: 0, status: 'zauzeta', image: require('../../assets/sobe/room1.jpg'), type: 'bračni', capacity: 2, bathrooms: 1, ac: true, kitchen: false, wifi: true, tv: true, jacuzzi: false, smoking: false, hallway: true, roomSize: '20m²', coffeeTeaMaker: true },
  { id: '2', name: 'Soba 2', beds: 3, children: 2, status: 'slobodna', image: require('../../assets/sobe/room2.jpg'), type: 'standard', capacity: 4, bathrooms: 2, ac: true, kitchen: true, wifi: true, tv: true, jacuzzi: true, smoking: false, hallway: true, roomSize: '35m²', coffeeTeaMaker: true },
  { id: '3', name: 'Soba 3', beds: 1, children: 1, status: 'slobodna', image: require('../../assets/sobe/room3.jpg'), type: 'standard', capacity: 3, bathrooms: 1, ac: false, kitchen: false, wifi: false, tv: false, jacuzzi: false, smoking: true, hallway: false, roomSize: '15m²', coffeeTeaMaker: false },
  { id: '4', name: 'Soba 4', beds: 2, children: 1, status: 'zauzeta', image: require('../../assets/sobe/room4.jpg'), type: 'standard', capacity: 4, bathrooms: 2, ac: true, kitchen: true, wifi: true, tv: true, jacuzzi: true, smoking: false, hallway: true, roomSize: '30m²', coffeeTeaMaker: true },
  { id: '5', name: 'Soba 5', beds: 3, children: 3, status: 'slobodna', image: require('../../assets/sobe/room5.jpg'), type: 'standard', capacity: 5, bathrooms: 2, ac: true, kitchen: true, wifi: true, tv: true, jacuzzi: true, smoking: true, hallway: true, roomSize: '40m²', coffeeTeaMaker: false },
  { id: '6', name: 'Soba 6', beds: 1, children: 0, status: 'zauzeta', image: require('../../assets/sobe/room1.jpg'), type: 'bračni', capacity: 2, bathrooms: 1, ac: false, kitchen: false, wifi: false, tv: false, jacuzzi: false, smoking: true, hallway: false, roomSize: '18m²' },
  { id: '7', name: 'Soba 7', beds: 2, children: 2, status: 'slobodna', image: require('../../assets/sobe/room2.jpg'), type: 'standard', capacity: 4, bathrooms: 2, ac: true, kitchen: true, wifi: true, tv: true, jacuzzi: true, smoking: false, hallway: true, roomSize: '35m²' },
  { id: '8', name: 'Soba 8', beds: 1, children: 1, status: 'zauzeta', image: require('../../assets/sobe/room3.jpg'), type: 'standard', capacity: 3, bathrooms: 1, ac: false, kitchen: false, wifi: false, tv: false, jacuzzi: false, smoking: true, hallway: false, roomSize: '15m²' },
  { id: '9', name: 'Soba 9', beds: 3, children: 1, status: 'slobodna', image: require('../../assets/sobe/room4.jpg'), type: 'standard', capacity: 5, bathrooms: 2, ac: true, kitchen: true, wifi: true, tv: true, jacuzzi: true, smoking: false, hallway: true, roomSize: '40m²' },
  { id: '10', name: 'Soba 10', beds: 2, children: 2, status: 'slobodna', image: require('../../assets/sobe/room5.jpg'), type: 'standard', capacity: 4, bathrooms: 2, ac: true, kitchen: true, wifi: true, tv: true, jacuzzi: true, smoking: false, hallway: true, roomSize: '30m²' },
];

const RoomList = () => {
  const navigation = useNavigation();
  const [selectedBeds, setSelectedBeds] = useState('all');
  const [selectedChildren, setSelectedChildren] = useState('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Funkcija za filtriranje soba
  const handleFilter = () => {
    let filteredRooms = roomsData;

    // Filtriraj po broju kreveta
    if (selectedBeds !== 'all') {
      if (selectedBeds === 'bračni') {
        filteredRooms = filteredRooms.filter(room => room.type === 'bračni');
      } else {
        filteredRooms = filteredRooms.filter(room => room.beds === parseInt(selectedBeds));
      }
    }

    // Filtriraj po broju djece
    if (selectedChildren !== 'all') {
      filteredRooms = filteredRooms.filter(room => room.children === parseInt(selectedChildren));
    }

    // Filtriraj samo dostupne sobe
    if (showAvailableOnly) {
      filteredRooms = filteredRooms.filter(room => room.status === 'slobodna');
    }

    return filteredRooms;
  };

  // Prikaz jedne sobe u listi
  const renderRoomItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('RoomDetailDescription', { room: item })}>
      <View style={styles.roomItem}>
        <Image source={item.image} style={styles.roomImage} />
        <View style={styles.roomDetails}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomInfo}>
            <Text style={styles.roomLabel}>Kreveti: </Text>
            {item.type === 'bračni' ? (
              <>
                <MaterialCommunityIcons name="bed-king-outline" size={16} color="#666" />
                <Text> Bračni krevet</Text>
              </>
            ) : (
              <>
                <Ionicons name="bed-outline" size={16} color="#666" />
                <Text> {item.beds === 1 ? 'Jednokrevetna' : item.beds === 2 ? 'Dvokrevetna' : 'Trokrevetna'} soba</Text>
              </>
            )}
          </Text>
          <Text style={styles.roomInfo}>
            <Text style={styles.roomLabel}>Djeca: </Text>
            <MaterialCommunityIcons name="human-child" size={16} color="#666" />
            <Text> {item.children === 1 ? '1 dijete' : `${item.children} djece`}</Text>
          </Text>
          <Text style={styles.roomStatus}>
            <Ionicons name={item.status === 'slobodna' ? "checkmark-circle-outline" : "close-circle-outline"} size={16} color={item.status === 'slobodna' ? "green" : "red"} />
            {item.status === 'slobodna' ? ' Slobodna' : ' Zauzeta'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Prikaz filtera (header)
  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Broj kreveta:</Text>
      <Picker
        selectedValue={selectedBeds}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedBeds(itemValue)}
      >
        <Picker.Item label="Sve" value="all" />
        <Picker.Item label="1 krevet" value="1" />
        <Picker.Item label="2 kreveta" value="2" />
        <Picker.Item label="3 kreveta" value="3" />
        <Picker.Item label="Bračni krevet" value="bračni" />
      </Picker>

      <Text style={styles.filterLabel}>Broj djece:</Text>
      <Picker
        selectedValue={selectedChildren}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedChildren(itemValue)}
      >
        <Picker.Item label="Sve" value="all" />
        <Picker.Item label="0 djece" value="0" />
        <Picker.Item label="1 dijete" value="1" />
        <Picker.Item label="2 djece" value="2" />
        <Picker.Item label="3 djece" value="3" />
      </Picker>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          <Ionicons
            name={showAvailableOnly ? "checkbox-outline" : "square-outline"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.label}>Samo dostupne sobe</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={handleFilter()}
      renderItem={renderRoomItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={renderHeader}
    />
  );
};

// Stilovi
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  label: {
    fontSize: 18,
  },
  roomItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    overflow: 'hidden',
  },
  roomImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  roomDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roomInfo: {
    fontSize: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomLabel: {
    fontWeight: 'bold',
  },
  roomStatus: {
    fontSize: 18,
    color: '#888',
  },
});

export default RoomList;