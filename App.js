import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { AuthProvider } from './screens/Korisnik/AuthContext'; // DODANO

// Uvoz ekrana
import HomeScreen from './screens/HomeScreen';
import RoomsStack from './screens/RoomsStack';
import UserStack from './screens/UserStack';
import RouteListScreen from './screens/RouteListScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';
import RouteMapScreen from './screens/InfoScreen/RouteMapScreen';
import OfflineMapsScreen from './screens/InfoScreen/OfflineMapsScreen';
import InfoScreen from './screens/InfoScreen/InfoScreen';
import MapLocationScreen from './screens/InfoScreen/MapLocationScreen';
import EmergencyContactsScreen from './screens/InfoScreen/EmergencyContactsScreen';
import MountainInfoScreen from './screens/InfoScreen/MountainInfoScreen';
import MountainDetailsScreen from './screens/InfoScreen/MountainDetailsScreen';
import WeatherWarningsScreen from './screens/InfoScreen/WeatherWarningsScreen';
import LoginScreen from './screens/Prijava/LoginScreen';
import RegisterScreen from './screens/Prijava/RegisterScreen';

import MapScreen from './screens/MapScreen';
import PlacesScreen from './screens/PlacesScreen';

// Uvoz AdminStack-a
import AdminStack from './screens/Admin/AdminStack';
import AdminMain from './screens/Admin/AdminMain';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigacija za Home ekran
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'Početna' }}
      />
      <Stack.Screen 
        name="RouteList" 
        component={RouteListScreen}
        options={({ route }) => ({ 
          title: `Rute - ${route.params?.mountainName || 'Planina'}`,
          headerStyle: {
            backgroundColor: '#f4f4f4',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{ title: 'Detalji Događaja' }}
      />
      <Stack.Screen
        name="RouteDetailScreen"
        component={RouteDetailScreen}
        options={{ title: 'Detalji Rute' }}
      />
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ 
          title: 'Mapa staze',
          headerStyle: {
            backgroundColor: '#f4f4f4',
          },
          headerTitleStyle: {
            fontWeight: '#000',
          },
        }}
      />
      <Stack.Screen
        name="PlacesScreen"
        component={PlacesScreen}
        options={{ 
          title: 'Objekti u blizini',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: '#000',
          },
        }}
      />
      <Stack.Screen
        name="RouteMapScreen"
        component={RouteMapScreen}
        options={{ title: 'Izračunaj Rutu' }}
      />      
    </Stack.Navigator>
  );
};

// Stack navigacija za Info ekran
const InfoNavigacija = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="InfoMain" 
        component={InfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TrenutnaLokacija" 
        component={MapLocationScreen} 
        options={{ title: 'Trenutna Lokacija' }}
      />
      <Stack.Screen 
        name="HitniKontakti" 
        component={EmergencyContactsScreen}
        options={{ title: 'Hitni Kontakti' }}
      />
      <Stack.Screen 
        name="InfoPlanine" 
        component={MountainInfoScreen}
        options={{ title: 'Informacije o Planinama' }}
      />
      <Stack.Screen 
        name="MountainDetails" 
        component={MountainDetailsScreen}
        options={{ title: 'Detalji o planini' }}
      />
      <Stack.Screen 
        name="VremenskaUpozorenja" 
        component={WeatherWarningsScreen}
        options={{ title: 'Vremenska Upozorenja' }}
      />
      <Stack.Screen 
        name="OfflineMape" 
        component={OfflineMapsScreen}
        options={{ title: 'Offline Mape' }}
      />
      <Stack.Screen 
        name="RouteMapScreen"
        component={RouteMapScreen}
        options={{ title: 'Izračunaj Rutu' }}
      />
    </Stack.Navigator>
  );
};

// Glavni Tab Navigator
const MainTabs = ({ route }) => {
  // Provjera admin statusa iz route parametara
  const { isAdmin } = route.params || { isAdmin: false };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let ikona;

          switch (route.name) {
            case 'Početna':
              ikona = 'home';
              break;
            case 'Info':
              ikona = 'info';
              break;
            case 'Smještaj':
              ikona = 'bed'; 
              break;
            case 'Profil':
              ikona = 'user';
              break;
            case 'Admin':
              ikona = 'settings';
              break;
            default:
              ikona = 'circle';
          }

          return (route.name === 'Smještaj') 
            ? <FontAwesome name={ikona} size={size} color={color} />
            : <Feather name={ikona} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f4f4f4',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Početna" 
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Info" 
        component={InfoNavigacija}
        options={{ title: 'Info Servis' }}
      />
      <Tab.Screen 
        name="Smještaj" 
        component={RoomsStack}
        options={{ title: 'Smještaj' }}
      />
      <Tab.Screen 
        name="Profil" 
        component={UserStack}
        options={{ title: 'Korisnički Profil' }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{ title: 'Admin Panel' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [logoScale] = useState(new Animated.Value(0));

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000);

    Animated.timing(logoScale, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.Image 
          source={require('./assets/logo.png')} 
          style={[styles.logoImage, { transform: [{ scale: logoScale }] }]} 
        />
        <Text style={styles.splashTitle}>Stazama BiH</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="AdminStack"
            component={AdminStack}
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: '#e6ffe6',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  logoImage: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 36,
    color: '#004d00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});