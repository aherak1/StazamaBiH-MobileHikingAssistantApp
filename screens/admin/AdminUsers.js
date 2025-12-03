import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Image,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';

const colors = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#4299E1',
  background: '#F7FAFC',
  border: '#E2E8F0',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  cardBackground: '#FFFFFF',
  success: '#28A745',
};

const AdminUsers = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Učitavanje korisnika
  useEffect(() => {
    loadUsers();
  }, []);

  // Preciznija funkcija filtriranja korisnika prema upitu za pretragu
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const cleanQuery = searchQuery.toLowerCase().trim();
      // Razdvajanje upita na riječi za preciznu pretragu
      const searchTerms = cleanQuery.split(/\s+/);
      
      const filtered = users.filter(user => {
        const firstName = user.firstName.toLowerCase();
        const lastName = user.lastName.toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        
        // Ako imamo samo jedan pojam za pretragu
        if (searchTerms.length === 1) {
          const term = searchTerms[0];
          // Provjerava da li jedan pojam odgovara pojedinačnim poljima
          return firstName.includes(term) || 
                 lastName.includes(term) || 
                 email.includes(term);
        } 
        // Ako imamo više pojmova (npr. ime i prezime)
        else {
          // Mora odgovarati puno ime (i ime i prezime) ili email
          return fullName.includes(cleanQuery) || email.includes(cleanQuery);
        }
      });
      
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Dobavljanje svih ključeva iz AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filtriranje ključeva koji pripadaju korisnicima
      const userKeys = allKeys.filter(key => key.startsWith('userData_'));
      
      // Priprema za dobavljanje svih korisničkih podataka
      const usersData = [];
      
      // Ako nema korisnika, dodajemo demo korisnika
      if (userKeys.length === 0) {
        // Demo korisnik ako nema podataka
        const demoUser = {
          id: '1',
          firstName: 'Demo',
          lastName: 'Korisnik',
          email: 'demo@example.com',
          phone: '+387 61 123 456',
          birthDate: new Date(1990, 0, 1).toISOString(),
          profileImage: null,
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dan unazad
        };
        
        usersData.push(demoUser);
        
        // Spremanje demo korisnika
        await AsyncStorage.setItem('userData_demo@example.com', JSON.stringify(demoUser));
      } else {
        // Dobavljanje podataka za svakog korisnika
        const userPromises = userKeys.map(async (key) => {
          const userData = await AsyncStorage.getItem(key);
          if (userData) {
            const user = JSON.parse(userData);
            // Dodavanje ID-a na osnovu email-a ako već ne postoji
            if (!user.id) {
              user.id = user.email.replace(/[^a-zA-Z0-9]/g, '_');
            }
            
            // VAŽNO: Ne mijenjamo lastActive ako već postoji
            // Ovo će se ažurirati samo kada se korisnik stvarno prijavi
            if (!user.lastActive) {
              user.lastActive = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dana unazad kao default
            }
            
            return user;
          }
          return null;
        });
        
        const usersResult = await Promise.all(userPromises);
        usersData.push(...usersResult.filter(user => user !== null));
      }
      
      // Također provjeri ima li korisnika u starom ključu 'userData'
      const oldUserData = await AsyncStorage.getItem('userData');
      if (oldUserData) {
        const oldUser = JSON.parse(oldUserData);
        // Provjera da li korisnik već postoji u novom formatu
        const exists = usersData.some(user => user.email === oldUser.email);
        
        if (!exists) {
          // Dodavanje ID-a
          oldUser.id = oldUser.id || oldUser.email.replace(/[^a-zA-Z0-9]/g, '_');
          
          // Ne mijenjamo lastActive ako postoji
          if (!oldUser.lastActive) {
            oldUser.lastActive = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          }
          
          usersData.push(oldUser);
          
          // Migriraj ovog korisnika u novi format
          await AsyncStorage.setItem(`userData_${oldUser.email}`, JSON.stringify(oldUser));
        }
      }
      
      // Sortiranje korisnika po imenu
      usersData.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      Alert.alert('Greška', 'Došlo je do greške prilikom učitavanja korisnika.');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Poboljšana funkcija za provjeru validnosti slike
  const isValidImageUri = (uri) => {
    if (!uri) return false;
    
    // Provjeri da li je string
    if (typeof uri !== 'string') return false;
    
    // Provjeri da li je prazan string
    if (uri.trim() === '') return false;
    
    // Provjeri da li počinje sa http/https ili file://
    const validProtocols = ['http://', 'https://', 'file://', 'data:image/'];
    const hasValidProtocol = validProtocols.some(protocol => uri.toLowerCase().startsWith(protocol));
    
    if (!hasValidProtocol) return false;
    
    // Provjeri da li ima validnu ekstenziju slike (opcionalno)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => 
      uri.toLowerCase().includes(ext) || uri.startsWith('data:image/')
    );
    
    return hasImageExtension;
  };

  // Komponenta za prikaz avatara sa error handling
  const UserAvatar = ({ user, size = 60, fontSize = 22 }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    
    const avatarSize = { width: size, height: size, borderRadius: size / 2 };
    const initials = getInitials(user.firstName, user.lastName);
    
    // Reset error state when user changes
    useEffect(() => {
      setImageError(false);
      setImageLoading(true);
    }, [user.profileImage]);
    
    // Ako nema slike ili je nevalidna, prikaži inicijale
    if (!isValidImageUri(user.profileImage) || imageError) {
      return (
        <View style={[styles.initialsContainer, avatarSize]}>
          <Text style={[styles.initialsText, { fontSize }]}>{initials}</Text>
        </View>
      );
    }
    
    return (
      <View style={avatarSize}>
        {imageLoading && (
          <View style={[styles.initialsContainer, avatarSize, { position: 'absolute', zIndex: 1 }]}>
            <ActivityIndicator size="small" color="white" />
          </View>
        )}
        <Image 
          source={{ uri: user.profileImage }}
          style={[styles.userAvatar, avatarSize]}
          onLoad={() => setImageLoading(false)}
          onError={(error) => {
            console.log('Image load error for user:', user.email, error.nativeEvent.error);
            setImageError(true);
            setImageLoading(false);
          }}
          onLoadStart={() => setImageLoading(true)}
        />
      </View>
    );
  };

  const renderUserItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => handleViewUserDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.userInfoContainer}>
          <UserAvatar user={item} size={60} fontSize={22} />
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.activityInfo}>
              <MaterialIcons name="access-time" size={14} color={colors.textSecondary} style={styles.activityIcon} />
              <Text style={styles.activityText}>
                Zadnja aktivnost: {formatDate(item.lastActive)}
              </Text>
            </View>
          </View>

          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={colors.textSecondary} 
            style={styles.chevronIcon} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Danas';
      } else if (diffDays === 2) {
        return 'Jučer';
      } else if (diffDays <= 7) {
        return `Prije ${diffDays - 1} dana`;
      } else {
        return format(date, 'dd.MM.yyyy.', { locale: bs });
      }
    } catch (error) {
      return 'Nepoznato';
    }
  };

  const renderUserDetailsModal = () => {
    if (!selectedUser) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalji korisnika</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.userProfileHeader}>
                <UserAvatar user={selectedUser} size={80} fontSize={30} />
                
                <View style={styles.userHeaderInfo}>
                  <Text style={styles.modalUserName}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Kontakt informacije</Text>
                
                <View style={styles.detailItem}>
                  <MaterialIcons name="email" size={20} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{selectedUser.email}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {selectedUser.phone || 'Nije postavljen'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialIcons name="cake" size={20} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {formatDate(selectedUser.birthDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Aktivnost korisnika</Text>
                
                <View style={styles.detailItem}>
                  <MaterialIcons name="access-time" size={20} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    Zadnja aktivnost: {formatDate(selectedUser.lastActive)}
                  </Text>
                </View>
                
                {selectedUser.isAdmin && (
                  <View style={styles.detailItem}>
                    <MaterialIcons name="admin-panel-settings" size={20} color={colors.success} />
                    <Text style={[styles.detailText, { color: colors.success }]}>
                      Administrator
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Zatvori</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Dodana funkcija za debounce pretrage - poboljšava korisničko iskustvo
  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Učitavanje korisnika...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pregled korisnika</Text>
        <View style={styles.userCountBadge}>
          <Text style={styles.userCountText}>{users.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Pretraži korisnike..."
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="person-search" size={60} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            {searchQuery !== "" 
              ? "Nisu pronađeni korisnici koji odgovaraju pretrazi."
              : "Nema registrovanih korisnika."
            }
          </Text>
          {searchQuery !== "" && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery("")}
            >
              <Text style={styles.clearSearchText}>Očisti pretragu</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Dodaj informaciju o rezultatima pretrage */}
      {searchQuery !== "" && filteredUsers.length > 0 && (
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultText}>
            Pronađeno {filteredUsers.length} rezultata
          </Text>
        </View>
      )}
      
      {renderUserDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  userCountBadge: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchResultInfo: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  searchResultText: {
    color: colors.accent,
    fontWeight: '500',
  },
  userCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 12,
  },
  initialsContainer: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    fontWeight: '300',
    color: 'white',
    letterSpacing: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    marginRight: 4,
  },
  activityText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearSearchText: {
    color: colors.accent,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalBody: {
    padding: 20,
  },
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalUserAvatar: {
    marginRight: 16,
  },
  modalInitialsContainer: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalInitialsText: {
    fontWeight: '300',
    color: 'white',
    letterSpacing: 1,
  },
  userHeaderInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  activeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  activeStatusText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminUsers;