import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoomsScreen from './RoomsScreen';
import RoomDetails from './RoomDetails';
import RoomList from './Sobe/RoomList'; // Import RoomList
import RoomDetailDescription from './Sobe/RoomDetailDescription'; // Import RoomDetailDescription for individual room
import ReservationDetails from './Sobe/ReservationDetails'; // Import ReservationDetails
import ReservationCalendar from './Sobe/ReservationCalendar'; // Import ReservationCalendar

const Stack = createStackNavigator();

function RoomsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RoomsScreen" 
        component={RoomsScreen} 
        options={{ title: 'Smještaji' }}
      />
      <Stack.Screen 
        name="RoomDetails" 
        component={RoomDetails} 
        options={{ title: 'Detalji Smještaja' }}
      />
      <Stack.Screen 
        name="RoomList" 
        component={RoomList} 
        options={{ title: 'Lista Soba' }}
      />
      <Stack.Screen 
        name="RoomDetailDescription" 
        component={RoomDetailDescription} 
        options={{ title: 'Detalji Sobe' }}
      />
      <Stack.Screen 
        name="ReservationDetails" 
        component={ReservationDetails} 
        options={{ title: 'Detalji Rezervacije' }}
      />
      <Stack.Screen 
        name="ReservationCalendar" 
        component={ReservationCalendar} 
        options={{ title: 'Kalendar' }}
      />
    </Stack.Navigator>
  );
}

export default RoomsStack;