import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const InfoScreen = ({ navigation }) => {
  const menuItems = [
    {
      title: 'Trenutna Lokacija',
      icon: 'map-pin',
      screen: 'TrenutnaLokacija',
      description: 'Prikaži vašu trenutnu lokaciju i koordinate'
    },
    {
      title: 'Hitni Kontakti',
      icon: 'phone',
      screen: 'HitniKontakti',
      description: 'Važni brojevi telefona i kontakti za hitne slučajeve'
    },
    {
      title: 'Informacije o Planinama',
      icon: 'map',
      screen: 'InfoPlanine',
      description: 'Detalji o planinama, stazama i preporuke'
    },
    {
      title: 'Vremenska Upozorenja',
      icon: 'cloud',
      screen: 'VremenskaUpozorenja',
      description: 'Trenutna vremenska situacija i upozorenja'
    },
    {
      title: 'Offline Mape',
      icon: 'map-pin',
      screen: 'OfflineMape',
      description: 'Preuzimanje mapa za offline korištenje'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Info Servis</Text>
        <Text style={styles.headerSubtitle}>Sve potrebne informacije na jednom mjestu</Text>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.iconContainer}>
              <Feather name={item.icon} size={24} color="#007AFF" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default InfoScreen;
