import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CONTACT_INFO = {
  phone: '+387 33 123 456',
  email: 'support@stazambih.com'
};

const handleContactPress = (type) => {
  if (type === 'phone') {
    Linking.openURL(`tel:${CONTACT_INFO.phone}`);
  } else if (type === 'email') {
    Linking.openURL(`mailto:${CONTACT_INFO.email}`);
  }
};

const ContactInfoRow = ({ label, value, type }) => (
  <TouchableOpacity 
    style={styles.contactRow}
    onPress={() => handleContactPress(type)}
    accessible={true}
    accessibilityLabel={`${label}: ${value}`}
    accessibilityRole="button"
  >
    <View style={styles.iconContainer}>
      <Ionicons 
        name={type === 'phone' ? 'call-outline' : 'mail-outline'} 
        size={24} 
        color="#4A90E2" 
      />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </TouchableOpacity>
);

const SupportScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ContactInfoRow
          label="Broj telefona"
          value={CONTACT_INFO.phone}
          type="phone"
        />
        <ContactInfoRow
          label="Email adresa"
          value={CONTACT_INFO.email}
          type="email"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
    lineHeight: 20,
  },
  value: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '400',
    lineHeight: 24,
  },
});

export default SupportScreen;