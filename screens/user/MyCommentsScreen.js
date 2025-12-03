import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/hr';

const colors = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#4299E1',
  danger: '#DC3545',
  background: '#F7FAFC',
  border: '#E2E8F0',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
};

const MyCommentsScreen = ({ navigation }) => {
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(`${user.firstName} ${user.lastName}`);
        }
      } catch (error) {
        console.error('Greška pri dohvaćanju korisnika:', error);
        setError('Došlo je do greške pri dohvaćanju korisnika');
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Učitaj komentare samo kad imamo identitet korisnika
    if (currentUser) {
      loadComments();
    }
  }, [currentUser]);

  const loadComments = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('comment_history');
      const comments = savedHistory ? JSON.parse(savedHistory) : [];
      setMyComments(comments.filter(comment => comment.korisnik === currentUser));
      setError(null);
    } catch (error) {
      setError('Došlo je do greške pri učitavanju komentara');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearComments = () => {
    Alert.alert(
      'Brisanje komentara',
      'Jeste li sigurni da želite trajno izbrisati sve svoje komentare?',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši sve',
          style: 'destructive',
          onPress: async () => {
            try {
              // Dohvati sve komentare
              const savedHistory = await AsyncStorage.getItem('comment_history');
              let allComments = savedHistory ? JSON.parse(savedHistory) : [];
              
              // Filtriraj tako da ostanu samo komentari drugih korisnika
              const filteredComments = allComments.filter(comment => comment.korisnik !== currentUser);
              
              // Spremi filtrirane komentare nazad
              await AsyncStorage.setItem('comment_history', JSON.stringify(filteredComments));
              
              // Ažuriraj prikaz
              setMyComments([]);
              Alert.alert('Uspjeh', 'Svi vaši komentari su uspješno obrisani');
            } catch (error) {
              setError('Greška pri brisanju komentara');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const renderCommentCard = (komentar, index) => (
    <View key={index} style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <MaterialIcons 
          name={komentar.type === 'accommodation' ? 'apartment' : 'directions-walk'} 
          size={20} 
          color={colors.accent} 
        />
        <Text style={styles.commentName}>{komentar.name}</Text>
      </View>

      <View style={styles.commentBody}>
        <Text style={styles.commentText}>„{komentar.tekst}"</Text>
      </View>

      <View style={styles.commentFooter}>
        <View style={styles.userBadge}>
          <MaterialIcons name="person-pin" size={16} color={colors.textPrimary} />
          <Text style={styles.userText}>{komentar.korisnik}</Text>
        </View>
        
        <View style={styles.metadataContainer}>
          {komentar.rating && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star-rate" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{komentar.rating}/5</Text>
            </View>
          )}
          <Text style={styles.timestamp}>
            {moment(komentar.timestamp).locale('hr').fromNow()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={40} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Ako nemamo korisnika, prikaži poruku za prijavu
  if (!currentUser) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="person-off" size={40} color={colors.textSecondary} />
        <Text style={styles.errorText}>Molimo prijavite se da biste vidjeli svoje komentare</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          <Text style={styles.loginButtonText}>Prijava</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {myComments.length > 0 ? (
          myComments.map(renderCommentCard)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="comment" size={60} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nema pronađenih komentara</Text>
          </View>
        )}
      </ScrollView>

      {myComments.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleClearComments}
          activeOpacity={0.8}
          accessibilityLabel="Obriši sve komentare"
        >
          <MaterialIcons name="delete-forever" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  commentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 10,
    flex: 1,
  },
  commentBody: {
    marginBottom: 12,
    paddingLeft: 30, // Dodatni padding za lepši poravnanje
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  userText: {
    fontSize: 14, // Povećano sa 13
    fontWeight: '600', // Povećan font-weight
    color: colors.textPrimary,
    marginLeft: 6,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.danger,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default MyCommentsScreen;