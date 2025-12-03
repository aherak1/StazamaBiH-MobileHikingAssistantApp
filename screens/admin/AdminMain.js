// screens/Admin/AdminMain.js
import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Alert,
  BackHandler
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const AdminMain = ({ navigation }) => {
  // Handler za dugme nazad
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Izlazak iz aplikacije",
          "Da li ste sigurni da želite izaći iz aplikacije?",
          [
            {
              text: "Odustani",
              onPress: () => null,
              style: "cancel"
            },
            { 
              text: "Izađi", 
              onPress: () => {
                // Vraćamo se na ekran za prijavu (Login)
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
        return true; // Vraćamo true da spriječimo standardno ponašanje
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const adminFunkcije = [
    {
      title: 'Događaji',
      icon: 'calendar',
      description: 'Kreiranje i organizacija događaja',
      screen: 'AdminEvents', // Izmijenjeno da cilja novi pregledni ekran
      color: '#FF9800'
    },
    {
      title: 'Korisnici',
      icon: 'users',
      description: 'Upravljanje korisničkim računima',
      screen: 'AdminUsers', // Budući ekran
      color: '#4CAF50'
    },
    {
      title: 'Upozorenja',
      icon: 'wind',
      description: 'Dodavanje i uređivanje informacija o nevremenu',
      screen: 'AdminWarnings', // Budući ekran
      color: '#795548'
    },
    {
      title: 'Statistika',
      icon: 'bar-chart-2',
      description: 'Pregled statistike aplikacije',
      screen: 'AdminStats', // Budući ekran
      color: '#607D8B'
    },
  ];

  const renderAdminCard = (item, index) => {
    return (
      <TouchableOpacity 
        key={index}
        style={styles.card}
        onPress={() => {
          // Kada se implementiraju odgovarajući ekrani, ova navigacija će raditi
          if (item.screen) {
            navigation.navigate(item.screen);
          } else {
            // Privremeno upozorenje dok se ne implementiraju ostali ekrani
            alert(`Ekran "${item.title}" još nije implementiran.`);
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Feather name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#757575" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upravljanje aplikacijom Stazama BiH</Text>
        </View>
        
        <View style={styles.cardsContainer}>
          {adminFunkcije.map((item, index) => renderAdminCard(item, index))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  cardsContainer: {
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 13,
    color: '#757575',
    marginTop: 3,
  },
});

export default AdminMain;