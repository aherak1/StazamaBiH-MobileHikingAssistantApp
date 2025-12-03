import React from 'react';
import { View, StyleSheet, Linking, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EmergencyContactsScreen = () => {
  const theme = useTheme();
  const emergencyContacts = [
    {
      id: '1',
      name: 'Hitna pomoć',
      number: '124',
      icon: 'ambulance',
      description: 'Za hitne medicinske slučajeve',
      color: '#D32F2F'
    },
    {
      id: '2',
      name: 'Gorska služba spašavanja',
      number: '112',
      icon: 'helicopter',
      description: 'Za spašavanje na planinama',
      color: '#1976D2'
    },
    {
      id: '3',
      name: 'Policija',
      number: '122',
      icon: 'police-badge',
      description: 'Za hitne policijske intervencije',
      color: '#F57C00'
    },
  ];

  const handleEmergencyCall = (number, name) => {
    Alert.alert(
      '⛑️ Hitni poziv',
      `Da li želite pozvati ${name}?\n\nBroj: ${number}`,
      [
        {
          text: 'Odustani',
          style: 'cancel',
        },
        {
          text: 'Pozovi',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${number}`)
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.warningCard, { backgroundColor: '#FFF3E0' }]}>
          <Card.Content>
            <View style={styles.warningHeader}>
              <Icon name="alert-octagon" size={24} color="#F57C00" />
              <Title style={[styles.warningTitle, { color: '#F57C00' }]}>
                Važna napomena
              </Title>
            </View>
            <Paragraph style={styles.warningText}>
              Ove brojeve koristite isključivo u slučaju stvarne hitne situacije.
              Neprimjerena upotreba može imati pravne posljedice.
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.contactsList}>
          {emergencyContacts.map(contact => (
            <Card key={contact.id} style={[styles.contactCard, { borderLeftWidth: 4, borderLeftColor: contact.color }]}>
              <Card.Content>
                <View style={styles.contactHeader}>
                  <Icon 
                    name={contact.icon} 
                    size={24}  // Smanjeno sa 28
                    color={contact.color}
                    style={styles.contactIcon}
                  />
                  <View style={styles.contactTitleWrapper}>
                    <Title style={styles.contactName}>{contact.name}</Title>
                    <Paragraph style={styles.contactNumber}>{contact.number}</Paragraph>
                  </View>
                </View>
                <Paragraph style={styles.contactDescription}>
                  {contact.description}
                </Paragraph>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="contained"
                  onPress={() => handleEmergencyCall(contact.number, contact.name)}
                  style={[styles.callButton, { backgroundColor: contact.color }]}
                  labelStyle={styles.callButtonLabel}
                  icon="phone"
                  contentStyle={styles.buttonContent}
                >
                  Hitni poziv
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16, // Smanjeno sa 20
    paddingBottom: 32,
  },
  warningCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    marginLeft: 12,
    fontSize: 18, // Smanjeno sa 20
    fontWeight: '600', // Umanjen bold
  },
  warningText: {
    fontSize: 15, // Smanjeno sa 18
    lineHeight: 20,
    color: '#666',
  },
  contactsList: {
    flex: 1,
    gap: 12, // Smanjeno sa 16
  },
  contactCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2, // Smanjeno sa 3
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Subtilnija sjena
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Smanjeno sa 12
  },
  contactIcon: {
    marginRight: 16, // Smanjeno sa 18
  },
  contactTitleWrapper: {
    flex: 1,
  },
  contactName: {
    fontSize: 18, // Smanjeno sa 20
    fontWeight: '600',
    marginBottom: 2, // Smanjeno sa 4
  },
  contactNumber: {
    fontSize: 16, // Smanjeno sa 18
    color: '#666',
    fontFamily: 'monospace',
  },
  contactDescription: {
    fontSize: 15, // Smanjeno sa 18
    color: '#444',
    lineHeight: 20,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  callButton: {
    flex: 1,
    borderRadius: 8,
    elevation: 2,
    height: 44, // Optimizirana visina
  },
  callButtonLabel: {
    color: 'white',
    fontSize: 16, // Smanjeno sa 18
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    height: 44, // Smanjeno sa 48
    paddingHorizontal: 16, // Smanjeno sa 20
  },
});

export default EmergencyContactsScreen;