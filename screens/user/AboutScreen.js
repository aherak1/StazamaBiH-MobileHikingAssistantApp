import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="information-circle" size={32} color={styles.colors.primary} />
          <Text style={styles.title}>StazamBiH</Text>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.description}>
            StazamBiH je premium aplikacija koja vam omogućava da istražujete najljepše staze Bosne i Hercegovine.
            Pronađete najbolje smještaje, rezervišite ih direktno putem aplikacije i ostavite svoje komentare i ocjene.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.missionText}>
            Naša misija je pružiti vam najbolje iskustvo prilikom istraživanja prirodnih ljepota naše zemlje kroz:
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="map-outline" size={20} color={styles.colors.primary} />
              <Text style={styles.featureText}>Detaljne interaktivne mape</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star-outline" size={20} color={styles.colors.primary} />
              <Text style={styles.featureText}>Personalizovane preporuke</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={styles.colors.primary} />
              <Text style={styles.featureText}>Sigurnu rezervaciju</Text>
            </View>
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginLeft: 12,
    color: '#2D3436',
    fontFamily: 'System',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
    color: '#636E72',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#DFE6E9',
    marginVertical: 20,
  },
  missionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D3436',
    marginBottom: 16,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 17,
    marginLeft: 12,
    color: '#636E72',
  },
  versionText: {
    textAlign: 'center',
    color: '#A0A0A0',
    marginTop: 32,
    fontSize: 13,
  },
  colors: {
    primary: '#4A90E2',
    secondary: '#2D3436',
  },
});

export default AboutScreen;