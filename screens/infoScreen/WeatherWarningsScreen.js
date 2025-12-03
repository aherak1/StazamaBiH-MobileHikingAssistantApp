import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WeatherWarningsScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [upozorenja, setUpozorenja] = useState([]);

  useEffect(() => {
    // Load admin warnings from AsyncStorage
    const loadAdminWarnings = async () => {
      try {
        const savedWarningsJSON = await AsyncStorage.getItem('adminWarnings');
        if (savedWarningsJSON) {
          const adminWarnings = JSON.parse(savedWarningsJSON);
          setUpozorenja(adminWarnings);
        }
      } catch (error) {
        console.error('Error loading admin warnings:', error);
      }
    };

    loadAdminWarnings();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {upozorenja.map((upozorenje, index) => (
          <View key={index} style={[
            styles.kartica, 
            styles[upozorenje.ozbiljnost],
            upozorenje.tip === 'SNIJEG I LED' && styles.snijegILed,
            upozorenje.tip === 'VISOKE TEMPERATURE' && styles.visokeTemperature
          ]}>
            <View style={styles.header}>
              <MaterialCommunityIcons 
                name={upozorenje.ikona} 
                size={32} 
                color={upozorenje.ikonaBoja || styles[upozorenje.ozbiljnost].borderLeftColor} 
              />
              <View style={styles.tipContainer}>
                <Text style={styles.tip}>{upozorenje.tip}</Text>
                <View style={styles.vrijemeContainer}>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={20} 
                    color="#4a5568" 
                    style={styles.vrijemeIkona}
                  />
                  <Text style={styles.datumVrijednost}>
                    {upozorenje.datum.split(' ')[0]}
                  </Text>
                  <MaterialCommunityIcons 
                    name="clock" 
                    size={20} 
                    color="#4a5568" 
                    style={styles.vrijemeIkona}
                  />
                  <Text style={styles.vrijemeVrijednost}>
                    {upozorenje.datum.split(' ')[1]} - {upozorenje.datum.split(' ')[3]}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.lokacijeContainer}>
              <MaterialCommunityIcons 
                name="map-marker-multiple" 
                size={20} 
                color="#4a5568" 
                style={styles.lokacijaIkona}
              />
              <Text style={styles.lokacijeTekst}>
                {upozorenje.lokacije.join(', ')}
              </Text>
            </View>

            <Text style={styles.opis}>{upozorenje.opis}</Text>

            <View style={styles.preporukeContainer}>
              <Text style={styles.preporukeNaslov}>
                <MaterialCommunityIcons 
                  name="shield-alert" 
                  size={18} 
                  color="#2d3748" 
                />
                {'  '}Sigurnosne mjere:
              </Text>
              {upozorenje.preporuke.map((preporuka, i) => (
                <View key={i} style={styles.preporuka}>
                  <MaterialCommunityIcons 
                    name="checkbox-marked-circle-outline" 
                    size={18} 
                    color="#48bb78" 
                  />
                  <Text style={styles.preporukaTekst}>{preporuka}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Animated.View>

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40
  },
  naslov: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  kartica: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  visoka: {
    borderLeftWidth: 5,
    borderLeftColor: '#dc2626'
  },
  umjerena: {
    borderLeftWidth: 5,
    borderLeftColor: '#f59e0b'
  },
  srednja: {
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6'
  },
  snijegILed: {
    borderLeftColor: '#3b82f6' // Plava boja za snijeg i led
  },
  visokeTemperature: {
    borderLeftColor: '#f59e0b' // Narandžasta boja za visoke temperature
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  tipContainer: {
    marginLeft: 16,
    flex: 1
  },
  tip: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 4
  },
  vrijemeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  vrijemeIkona: {
    marginRight: 4,
  },
  datumVrijednost: {
    fontSize: 15,
    color: '#2d3748',
    fontWeight: '600',
    marginRight: 12,
  },
  vrijemeVrijednost: {
    fontSize: 15,
    color: '#2d3748',
    fontWeight: '600',
  },
  lokacijeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8
  },
  lokacijaIkona: {
    marginRight: 10
  },
  lokacijeTekst: {
    fontSize: 18,
    color: '#2d3748',
    flex: 1,
    lineHeight: 22,
    fontWeight: '500'
  },
  opis: {
    fontSize: 18,
    lineHeight: 24,
    color: '#2d3748',
    marginBottom: 20,
    fontWeight: '400'
  },
  preporukeContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16
  },
  preporukeNaslov: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  preporuka: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 4
  },
  preporukaTekst: {
    fontSize: 18,
    color: '#2d3748',
    marginLeft: 12,
    lineHeight: 22,
    flex: 1
  },
  footerSpacing: {
    height: 30
  }
});

export default WeatherWarningsScreen;