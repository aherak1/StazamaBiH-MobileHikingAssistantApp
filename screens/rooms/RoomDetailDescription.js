import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ReservationCalendar from './ReservationCalendar';

const RoomDetailDescription = ({ route }) => {
  const { room } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={room.image} style={styles.image} />
      <Text style={styles.name}>{room.name}</Text>
      <Text style={styles.description}>
        Ova soba je svijetla i ima prekrasan pogled na more. Savršena je za opuštanje i uživanje u udobnosti.
      </Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.detailText}>Kapacitet: {room.capacity} osoba</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="shower" size={24} color="#666" />
          <Text style={styles.detailText}>Broj kupatila: {room.bathrooms}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="ruler-square" size={24} color="#666" />
          <Text style={styles.detailText}>
            Površina: {room.roomSize ? room.roomSize.replace('m²', '') : 'N/A'} m²
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="snow-outline" size={24} color="#666" />
          <Text style={styles.detailText}>{room.ac ? 'Posjeduje klimu' : 'Bez klime'}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#666" />
          <Text style={styles.detailText}>{room.kitchen ? 'Posjeduje kuhinju' : 'Bez kuhinje'}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="coffee" size={24} color="#666" />
          <Text style={styles.detailText}>{room.coffeeTeaMaker ? 'Aparat za kahvu/čaj' : 'Bez aparata za kahvu/čaj'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="wifi-outline" size={24} color="#666" />
          <Text style={styles.detailText}>{room.wifi ? 'Besplatni Wi-Fi' : 'Bez Wi-Fi-a'}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="television" size={24} color="#666" />
          <Text style={styles.detailText}>{room.tv ? 'Televizija' : 'Bez televizije'}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="hot-tub" size={24} color="#666" />
          <Text style={styles.detailText}>{room.jacuzzi ? 'Posjeduje jakuzi' : 'Bez jakuzija'}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="smoking" size={24} color="#666" />
          <Text style={styles.detailText}>{room.smoking ? 'Namijenjeno za pušače' : 'Nije namijenjeno za pušače'}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="floor-plan" size={24} color="#666" />
          <Text style={styles.detailText}>{room.hallway ? 'Posjeduje predsoblje' : 'Bez predsoblja'}</Text>
        </View>
        {room.seaView && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="sea" size={24} color="#666" />
            <Text style={styles.detailText}>Pogled na more</Text>
          </View>
        )}
        {room.natureView && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="pine-tree" size={24} color="#666" />
            <Text style={styles.detailText}>Pogled na prirodu</Text>
          </View>
        )}
        {room.balcony && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="balcony" size={24} color="#666" />
            <Text style={styles.detailText}>Balkon</Text>
          </View>
        )}
        {room.garden && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="flower" size={24} color="#666" />
            <Text style={styles.detailText}>Bašta</Text>
          </View>
        )}
      </View>
      {room.status === 'slobodna' && <ReservationCalendar room={room} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
    width: '45%', // Adjusted to fit two items per row
  },
  detailText: {
    fontSize: 18,
    marginLeft: 8,
  },
});

export default RoomDetailDescription;