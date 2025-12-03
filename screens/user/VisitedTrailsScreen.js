import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const VisitedTrailsScreen = ({ navigation }) => {
  const [visitedTrails, setVisitedTrails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVisitedTrails = async () => {
  try {
    setRefreshing(true);
    const trailsJSON = await AsyncStorage.getItem('visitedTrails');
    const currentUserData = await AsyncStorage.getItem('currentUser');
    
    const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
    const trails = trailsJSON ? JSON.parse(trailsJSON) : [];
    
    // Filtriraj staze za trenutnog korisnika
    const userTrails = trails.filter(trail => trail.korisnik === `${currentUser.firstName} ${currentUser.lastName}`);
    
    const sortedTrails = userTrails.sort((a, b) => 
      new Date(b.datumPosjete) - new Date(a.datumPosjete)
    );
    
    setVisitedTrails(sortedTrails);
  } catch (error) {
    console.error('Error loading visited trails:', error);
    Alert.alert('Greška', 'Došlo je do greške pri učitavanju posjećenih staza');
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
};

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadVisitedTrails);
    return unsubscribe;
  }, [navigation]);

  const handleRemoveVisit = async (visitId) => {
    Alert.alert(
      'Ukloni posjetu',
      'Da li ste sigurni da želite ukloniti ovu posjetu iz evidencije?',
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Ukloni',
          onPress: async () => {
            try {
              const updatedTrails = visitedTrails.filter(trail => trail.visitId !== visitId);
              await AsyncStorage.setItem('visitedTrails', JSON.stringify(updatedTrails));
              setVisitedTrails(updatedTrails);
              Alert.alert('Uspjeh', 'Posjeta je uspješno uklonjena');
            } catch (error) {
              console.error('Error removing visit:', error);
              Alert.alert('Greška', 'Došlo je do greške pri uklanjanju posjete');
            }
          }
        }
      ]
    );
  };

  const getVisitCount = (trailId) => {
    return visitedTrails.filter(trail => trail.id === trailId).length;
  };

  const renderTrailItem = ({ item }) => {
    return (
      <View style={styles.trailItem}>
        {item.slike && item.slike.length > 0 && (
          <Image 
            source={item.slike[0]} 
            style={styles.trailImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.trailContent}>
          <Text style={styles.trailName} numberOfLines={2}>
            {item.naziv || 'Nepoznata staza'}
          </Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.trailText}> {item.lokacija}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.trailText}> {moment(item.datumPosjete).format('D.MM.YYYY. HH:mm')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.trailText}> {item.rating}</Text>
          </View>
        </View>
        
        <View style={styles.rightColumn}>
          <View style={styles.bottomIcons}>
            <View style={styles.visitCountContainer}>
              <Text style={styles.visitCount}>{getVisitCount(item.id)}x</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleRemoveVisit(item.visitId)}
            >
              <Ionicons name="trash-outline" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      
      {visitedTrails.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sad-outline" size={60} color="#95a5a6" />
          <Text style={styles.emptyText}>Nema evidentiranih posjeta</Text>
          <Text style={styles.emptySubtext}>
            Kliknite na "Evidentiraj posjetu" na detaljima staze
          </Text>
        </View>
      ) : (
        <FlatList
          data={visitedTrails}
          renderItem={renderTrailItem}
          keyExtractor={(item) => item.visitId}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadVisitedTrails}
              colors={['#008080']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    padding: 8,
  },
  trailItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    padding: 10,
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trailImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
    marginRight: 10,
  },
  trailContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  trailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trailText: {
    fontSize: 13,
    color: '#666',
  },
  rightColumn: {
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  bottomIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 4,
  },
  visitCountContainer: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  visitCount: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default VisitedTrailsScreen;