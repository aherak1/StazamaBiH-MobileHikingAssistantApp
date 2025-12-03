// screens/Admin/AdminStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// Admin ekrani
import AdminMain from './AdminMain';
import AdminEvents from './AdminEvents';
import AdminEventForm from './AdminEventForm';
import AdminUsers from './AdminUsers';
import AdminStats from './AdminStats'; // Dodan uvoz za AdminStats
import AdminWarnings from './AdminWarnings';
const Stack = createStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminMain"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4f4f4',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="AdminMain" 
        component={AdminMain} 
        options={{ title: 'Admin kontrolni panel' }} 
      />
      
      <Stack.Screen 
        name="AdminEvents" 
        component={AdminEvents} 
        options={{ title: 'Upravljanje događajima' }} 
      />
      
      <Stack.Screen 
        name="AdminEventForm" 
        component={AdminEventForm} 
        options={{ title: 'Kreiranje događaja' }} 
      />
      
      <Stack.Screen 
        name="AdminUsers" 
        component={AdminUsers} 
        options={{ title: 'Upravljanje korisnicima' }} 
      />
      
      <Stack.Screen 
        name="AdminStats" 
        component={AdminStats} 
        options={{ title: 'Statistike' }} 
      />
      <Stack.Screen 
        name="AdminWarnings" 
        component={AdminWarnings} 
        options={{ title: 'Upozorenja' }} 
      />
    </Stack.Navigator>
  );
};

export default AdminStack;