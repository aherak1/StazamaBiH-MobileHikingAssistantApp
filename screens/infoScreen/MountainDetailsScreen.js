import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MountainDetailsScreen = ({ route }) => {
  const { mountain } = route.params;

  const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color="#2F4F4F" 
        style={styles.sectionIcon}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image 
          source={mountain.image}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.gradientOverlay}
        />
        <View style={styles.heroContent}>
          <Text style={styles.mountainName}>{mountain.name}</Text>
          <Text style={styles.heroSubtitle}>Planinski vrh u Bosni i Hercegovini</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.contentWrapper}>
        {/* Opis Sekcija */}
        <View style={styles.section}>
          <SectionHeader icon="text-box-outline" title="O planini" />
          <Text style={styles.description}>
            <Text style={styles.highlightText}>{mountain.description}</Text>
            
            <Text style={styles.contextInfo}>
              {"\n\n"}Nadmorska visina: {mountain.altitude} m.n.v.
              {"\n"}Površina: ~{mountain.area} km²
              {"\n"}Označene staze: {mountain.trails}
            </Text>
          </Text>
        </View>

        {/* Smještaj */}
        <View style={styles.section}>
          <SectionHeader icon="home-city" title="Smještajne preporuke" />
          {mountain.accommodation.map((acc, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialCommunityIcons 
                name="bed-king" 
                size={20} 
                color="#1E88E5" 
              />
              <Text style={styles.listText}>{acc}</Text>
            </View>
          ))}
        </View>

        {/* Sadržaji */}
        <View style={[styles.section, styles.facilitiesSection]}>
          <SectionHeader icon="checkbox-marked-circle" title="Turistička ponuda" />
          <View style={styles.facilitiesGrid}>
            {mountain.facilities.map((facility, index) => (
              <View key={index} style={styles.facilityBadge}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={16} 
                  color="#228B22" 
                />
                <Text style={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sigurnosne napomene */}
        <View style={[styles.section, styles.warningSection]}>
          <SectionHeader icon="alert-octagram" title="Važne informacije" />
          {mountain.dangers.map((danger, index) => (
            <View key={index} style={styles.warningItem}>
              <MaterialCommunityIcons 
                name="alert" 
                size={20} 
                color="#D32F2F" 
              />
              <Text style={styles.warningText}>{danger}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  heroContainer: {
    height: 280,
    marginBottom: 24,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '60%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  mountainName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  contentWrapper: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F4F8',
    paddingBottom: 12,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2F4F4F',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  highlightText: {
    fontWeight: '400',
  },
  contextInfo: {
    color: '#666',
    marginTop: 12,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  listText: {
    fontSize: 16,
    color: '#444',
    marginLeft: 16,
    flex: 1,
  },
  facilitiesSection: {
    backgroundColor: '#F8FFF8',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  facilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7ED',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  facilityText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
    fontWeight: '500',
  },
  warningSection: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  warningText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '500',
    marginLeft: 16,
    flex: 1,
  },
});

export default MountainDetailsScreen;