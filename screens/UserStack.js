// UserStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './Korisnik/ProfileScreen';
import UserInfoScreen from './Korisnik/UserInfoScreen';
import SettingsScreen from './Korisnik/SettingsScreen';
import PersonalizationScreen from './Korisnik/PersonalizationScreen';
import SupportScreen from './Korisnik/SupportScreen';
import AboutScreen from './Korisnik/AboutScreen';
import StatisticsScreen from './Korisnik/StatisticsScreen';
import SignInScreen from './Korisnik/SignInScreen';
import MyCommentsScreen from './Korisnik/MyCommentsScreen';
import MyReservations from './Korisnik/MyReservations';
import PrivacySettingsScreen from './Korisnik/PrivacySettingsScreen'; // Dodan import
import VisitedTrailsScreen from './Korisnik/VisitedTrailsScreen'; // Dodajte ovaj import

const Stack = createStackNavigator();

function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }}
      />
      <Stack.Screen 
        name="UserInfoScreen" 
        component={UserInfoScreen} 
        options={{ title: 'Korisničke informacije' }}
      />
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options={{ title: 'Postavke' }}
      />
      <Stack.Screen 
        name="PrivacySettingsScreen" // Dodan novi screen
        component={PrivacySettingsScreen} 
        options={{ title: 'Zaštita podataka' }}
      />
      <Stack.Screen 
        name="PersonalizationScreen" 
        component={PersonalizationScreen} 
        options={{ title: 'Personalizacija' }}
      />
      <Stack.Screen 
        name="SupportScreen" 
        component={SupportScreen} 
        options={{ title: 'Podrška' }}
      />
      <Stack.Screen 
        name="AboutScreen" 
        component={AboutScreen} 
        options={{ title: 'O nama' }}
      />
      <Stack.Screen 
        name="StatisticsScreen" 
        component={StatisticsScreen} 
        options={{ title: 'Statistika' }}
      />
      <Stack.Screen 
        name="SignInScreen" 
        component={SignInScreen} 
        options={{ title: 'Prijava' }}
      />
      <Stack.Screen 
        name="MyCommentsScreen" 
        component={MyCommentsScreen} 
        options={{ title: 'Moji komentari' }}
      />
      <Stack.Screen 
        name="MyReservations" 
        component={MyReservations} 
        options={{ title: 'Moje rezervacije' }}
      />
      <Stack.Screen 
        name="VisitedTrailsScreen" 
        component={VisitedTrailsScreen} 
        options={{ title: 'Posjećene staze' }}
      />
    </Stack.Navigator>
  );
}

export default UserStack;