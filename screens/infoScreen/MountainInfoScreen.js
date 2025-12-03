import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { mountainsData } from './mountainsData';

const MountainInfoScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleMountainPress = (mountain) => {
    navigation.navigate('MountainDetails', { mountain });
  };

  const filteredMountains = mountainsData.filter(mountain =>
    mountain.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={24} 
            color="#666" 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži planine..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Glavni sadržaj */}
      <ScrollView contentContainerStyle={[
        styles.scrollContent,
        filteredMountains.length === 0 && styles.emptyScrollContent
      ]}>
        {filteredMountains.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <MaterialCommunityIcons 
              name="magnify-remove" 
              size={60} 
              color="#666" 
              style={styles.noResultsIcon}
            />
            <Text style={styles.noResultsHeading}>Nema rezultata</Text>
            <Text style={styles.noResultsText}>
              Nije pronađena planina sa nazivom "{searchQuery.trim()}"
            </Text>
          </View>
        ) : (
          filteredMountains.map((mountain) => (
            <TouchableOpacity
              key={mountain.id}
              style={styles.mountainCard}
              onPress={() => handleMountainPress(mountain)}
              activeOpacity={0.9}
            >
              <Image 
                source={mountain.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradientOverlay}
              />
              
              <View style={styles.cardContent}>
                <Text style={styles.mountainName}>{mountain.name}</Text>
                
                <View style={styles.infoBadges}>
                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="arrow-up" size={16} color="#FFF" />
                    <Text style={styles.badgeText}>{mountain.altitude} m</Text>
                  </View>
                  
                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="hiking" size={16} color="#FFF" />
                    <Text style={styles.badgeText}>{mountain.trails} staza</Text>
                  </View>

                  {mountain.area && (
                    <View style={styles.badge}>
                      <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#FFF" />
                      <Text style={styles.badgeText}>{mountain.area} km²</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  mountainCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  mountainName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  infoBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsIcon: {
    opacity: 0.8,
    marginBottom: 20,
  },
  noResultsHeading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MountainInfoScreen;