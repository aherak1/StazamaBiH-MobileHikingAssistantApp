import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PersonalizationScreen = ({ navigation }) => {
  const menuItems = [
    {
      id: '1',
      title: 'Moji komentari',
      icon: 'comment',
      screen: 'MyCommentsScreen',
    },
    {
      id: '2',
      title: 'Moje rezervacije',
      icon: 'event',
      screen: 'MyReservations',
    },
    {
      id: '3',
      title: 'Posjećene staze',
      icon: 'directions-walk',
      screen: 'VisitedTrailsScreen',
    },
  ];

  return (
    <View style={styles.container}>
     
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
            accessibilityLabel={item.title}
            accessibilityRole="button"
          >
            <View style={styles.itemContent}>
              <MaterialIcons 
                name={item.icon} 
                size={24} 
                style={styles.icon} 
              />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              style={styles.chevron} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <MaterialIcons name="info-outline" size={20} style={styles.infoIcon} />
        <Text style={styles.infoText}>
          Upravljajte svojim osobnim podacima i poviješću aktivnosti
        </Text>
      </View>
    </View>
  );
};

const colors = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#4299E1',
  background: '#F7FAFC',
  border: '#E2E8F0',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  menuContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 16,
    fontWeight: '500',
  },
  icon: {
    color: colors.accent,
  },
  chevron: {
    color: colors.secondary,
    opacity: 0.8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  infoIcon: {
    color: colors.secondary,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
  },
});

export default PersonalizationScreen;