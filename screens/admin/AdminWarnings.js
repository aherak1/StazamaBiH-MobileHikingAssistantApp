import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminWarnings = () => {
  // Default state for a new warning
  const initialWarningState = {
    tip: '',
    opis: '',
    datumPocetka: new Date(),
    datumKraja: new Date(),
    lokacije: '',
    preporuke: [''],
    ozbiljnost: 'srednja',
    ikona: 'alert-circle'
  };

  // States
  const [warning, setWarning] = useState({...initialWarningState});
  const [allWarnings, setAllWarnings] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Icons to choose from (translated to Bosnian)
  const ikonaOpcije = [
    { naziv: 'Upozorenje', value: 'alert-circle' },
    { naziv: 'Jak vjetar', value: 'weather-windy' },
    { naziv: 'Snijeg', value: 'snowflake' },
    { naziv: 'Visoka temperatura', value: 'thermometer-alert' },
    { naziv: 'Poplava', value: 'water' },
    { naziv: 'Grmljavina', value: 'weather-lightning' },
    { naziv: 'Magla', value: 'weather-fog' },
    { naziv: 'Požar', value: 'fire' }
  ];

  // Severity options
  const ozbiljnostOpcije = [
    { naziv: 'Visoka', value: 'visoka' },
    { naziv: 'Umjerena', value: 'umjerena' },
    { naziv: 'Srednja', value: 'srednja' }
  ];

  // Load saved warnings on component mount
  useEffect(() => {
    loadWarnings();
  }, []);

  // Load warnings from AsyncStorage
  const loadWarnings = async () => {
    try {
      const savedWarningsJSON = await AsyncStorage.getItem('adminWarnings');
      if (savedWarningsJSON) {
        const savedWarnings = JSON.parse(savedWarningsJSON);
        // Convert date strings back to Date objects
        const processedWarnings = savedWarnings.map(warning => ({
          ...warning,
          datumPocetka: new Date(warning.datumPocetka),
          datumKraja: new Date(warning.datumKraja)
        }));
        setAllWarnings(processedWarnings);
      }
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće učitati upozorenja: ' + error.message);
    }
  };

  // Save warnings to AsyncStorage
  const saveWarnings = async (updatedWarnings) => {
    try {
      await AsyncStorage.setItem('adminWarnings', JSON.stringify(updatedWarnings));
    } catch (error) {
      Alert.alert('Greška', 'Nije moguće sačuvati upozorenja: ' + error.message);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Format time for display
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle datetime picker changes
  const onDateChange = (event, selectedDate, pickerType) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      setShowStartTimePicker(false);
      setShowEndDatePicker(false);
      setShowEndTimePicker(false);
    }
    
    if (selectedDate) {
      const currentDate = selectedDate;
      
      switch (pickerType) {
        case 'startDate':
          const updatedStartDate = new Date(warning.datumPocetka);
          updatedStartDate.setFullYear(currentDate.getFullYear());
          updatedStartDate.setMonth(currentDate.getMonth());
          updatedStartDate.setDate(currentDate.getDate());
          setWarning({...warning, datumPocetka: updatedStartDate});
          break;
        case 'startTime':
          const updatedStartTime = new Date(warning.datumPocetka);
          updatedStartTime.setHours(currentDate.getHours());
          updatedStartTime.setMinutes(currentDate.getMinutes());
          setWarning({...warning, datumPocetka: updatedStartTime});
          break;
        case 'endDate':
          const updatedEndDate = new Date(warning.datumKraja);
          updatedEndDate.setFullYear(currentDate.getFullYear());
          updatedEndDate.setMonth(currentDate.getMonth());
          updatedEndDate.setDate(currentDate.getDate());
          setWarning({...warning, datumKraja: updatedEndDate});
          break;
        case 'endTime':
          const updatedEndTime = new Date(warning.datumKraja);
          updatedEndTime.setHours(currentDate.getHours());
          updatedEndTime.setMinutes(currentDate.getMinutes());
          setWarning({...warning, datumKraja: updatedEndTime});
          break;
      }
    }
  };

  // Add new recommendation
  const addPreporuka = () => {
    setWarning({
      ...warning,
      preporuke: [...warning.preporuke, '']
    });
  };

  // Update recommendation text
  const updatePreporuka = (text, index) => {
    const updatedPreporuke = [...warning.preporuke];
    updatedPreporuke[index] = text;
    setWarning({
      ...warning,
      preporuke: updatedPreporuke
    });
  };

  // Remove a recommendation
  const removePreporuka = (index) => {
    if (warning.preporuke.length > 1) {
      const updatedPreporuke = [...warning.preporuke];
      updatedPreporuke.splice(index, 1);
      setWarning({
        ...warning,
        preporuke: updatedPreporuke
      });
    }
  };

  // Edit existing warning
  const editWarning = (index) => {
    const warningToEdit = allWarnings[index];
    setWarning({
      ...warningToEdit,
      lokacije: warningToEdit.lokacije.join(', '),
      datumPocetka: new Date(warningToEdit.datumPocetka),
      datumKraja: new Date(warningToEdit.datumKraja)
    });
    setEditingIndex(index);
  };

  // Save or update warning
  const saveWarning = () => {
    // Validation
    if (!warning.tip || !warning.opis || !warning.lokacije) {
      Alert.alert('Greška', 'Molimo popunite sva obavezna polja');
      return;
    }

    // Create formatted warning object
    const formattedWarning = {
      ...warning,
      lokacije: warning.lokacije.split(',').map(item => item.trim()),
      datum: `${formatDate(warning.datumPocetka)} ${formatTime(warning.datumPocetka)} - ${formatTime(warning.datumKraja)}`,
      // Remove any empty recommendations
      preporuke: warning.preporuke.filter(p => p.trim() !== '')
    };

    if (formattedWarning.preporuke.length === 0) {
      formattedWarning.preporuke = ['Budite na oprezu'];
    }

    // Add icon color based on severity
    switch (formattedWarning.ozbiljnost) {
      case 'visoka':
        formattedWarning.ikonaBoja = '#dc2626';
        break;
      case 'umjerena':
        formattedWarning.ikonaBoja = '#f59e0b';
        break;
      case 'srednja':
        formattedWarning.ikonaBoja = '#3b82f6';
        break;
    }

    let updatedWarnings;
    if (editingIndex !== null) {
      // Update existing warning
      updatedWarnings = [...allWarnings];
      updatedWarnings[editingIndex] = formattedWarning;
      setEditingIndex(null);
    } else {
      // Add new warning
      updatedWarnings = [...allWarnings, formattedWarning];
    }

    setAllWarnings(updatedWarnings);
    saveWarnings(updatedWarnings);

    // Reset form
    setWarning({...initialWarningState});
    Alert.alert('Uspjeh', `Upozorenje je uspješno ${editingIndex !== null ? 'ažurirano' : 'dodano'}!`);
  };

  // Cancel editing
  const cancelEditing = () => {
    setWarning({...initialWarningState});
    setEditingIndex(null);
  };

  // Delete a warning
  const deleteWarning = (index) => {
    Alert.alert(
      'Potvrda',
      'Da li ste sigurni da želite obrisati ovo upozorenje?',
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: () => {
            const updatedWarnings = [...allWarnings];
            updatedWarnings.splice(index, 1);
            setAllWarnings(updatedWarnings);
            saveWarnings(updatedWarnings);
            if (editingIndex === index) {
              cancelEditing();
            }
          }
        }
      ]
    );
  };

  // Render a warning in the list
  const renderWarningItem = ({ item, index }) => (
    <View style={styles.warningItem}>
      <TouchableOpacity 
        style={styles.warningContent}
        onPress={() => editWarning(index)}
      >
        <View style={styles.warningHeader}>
          <MaterialCommunityIcons name={item.ikona} size={24} color={item.ikonaBoja} />
          <Text style={styles.warningTitle}>{item.tip}</Text>
        </View>
        <Text style={styles.warningDate}>{item.datum}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteWarning(index)}
      >
        <MaterialCommunityIcons name="delete" size={24} color="#e53e3e" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.naslov}>
        {editingIndex !== null ? 'Uredi upozorenje' : 'Dodaj novo upozorenje'}
      </Text>
      
      {editingIndex !== null && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={cancelEditing}
        >
          <Text style={styles.cancelButtonText}>Odustani od uređivanja</Text>
        </TouchableOpacity>
      )}
      
      {/* Type of warning */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tip upozorenja:</Text>
        <TextInput
          style={styles.input}
          value={warning.tip}
          onChangeText={(text) => setWarning({...warning, tip: text})}
          placeholder="npr. JAK VJETAR"
        />
      </View>
      
      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Opis:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={warning.opis}
          onChangeText={(text) => setWarning({...warning, opis: text})}
          placeholder="Detaljan opis upozorenja"
          multiline
          numberOfLines={3}
        />
      </View>
      
      {/* Start date/time */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Početak:</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowStartDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#4a5568" />
            <Text style={styles.dateTimeText}>{formatDate(warning.datumPocetka)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeInput} 
            onPress={() => setShowStartTimePicker(true)}
          >
            <MaterialCommunityIcons name="clock" size={20} color="#4a5568" />
            <Text style={styles.dateTimeText}>{formatTime(warning.datumPocetka)}</Text>
          </TouchableOpacity>
        </View>
        
        {showStartDatePicker && (
          <DateTimePicker
            value={warning.datumPocetka}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={(event, date) => onDateChange(event, date, 'startDate')}
          />
        )}
        
        {showStartTimePicker && (
          <DateTimePicker
            value={warning.datumPocetka}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, date) => onDateChange(event, date, 'startTime')}
          />
        )}
      </View>
      
      {/* End time */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Kraj (vrijeme):</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowEndDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar" size={20} color="#4a5568" />
            <Text style={styles.dateTimeText}>{formatDate(warning.datumKraja)}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeInput} 
            onPress={() => setShowEndTimePicker(true)}
          >
            <MaterialCommunityIcons name="clock" size={20} color="#4a5568" />
            <Text style={styles.dateTimeText}>{formatTime(warning.datumKraja)}</Text>
          </TouchableOpacity>
        </View>
        
        {showEndDatePicker && (
          <DateTimePicker
            value={warning.datumKraja}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={(event, date) => onDateChange(event, date, 'endDate')}
          />
        )}
        
        {showEndTimePicker && (
          <DateTimePicker
            value={warning.datumKraja}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, date) => onDateChange(event, date, 'endTime')}
          />
        )}
      </View>
      
      {/* Locations */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Lokacije (razdvojene zarezom):</Text>
        <TextInput
          style={styles.input}
          value={warning.lokacije}
          onChangeText={(text) => setWarning({...warning, lokacije: text})}
          placeholder="npr. Sarajevo, Mostar, Tuzla"
        />
      </View>
      
      {/* Recommendations */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Sigurnosne mjere:</Text>
        {warning.preporuke.map((preporuka, index) => (
          <View key={index} style={styles.preporukaContainer}>
            <TextInput
              style={styles.preporukaInput}
              value={preporuka}
              onChangeText={(text) => updatePreporuka(text, index)}
              placeholder="Unesite preporuku"
            />
            <TouchableOpacity
              style={styles.removePreporukaButton}
              onPress={() => removePreporuka(index)}
              disabled={warning.preporuke.length === 1}
            >
              <MaterialCommunityIcons 
                name="minus-circle" 
                size={24} 
                color={warning.preporuke.length === 1 ? "#cbd5e0" : "#e53e3e"} 
              />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addPreporukaButton} onPress={addPreporuka}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#48bb78" />
          <Text style={styles.addPreporukaText}>Dodaj novu mjeru</Text>
        </TouchableOpacity>
      </View>
      
      {/* Severity dropdown */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ozbiljnost:</Text>
        <View style={styles.pickerContainer}>
          {ozbiljnostOpcije.map((opcija) => (
            <TouchableOpacity
              key={opcija.value}
              style={[
                styles.ozbiljnostOption,
                warning.ozbiljnost === opcija.value && styles.selectedOzbiljnost,
                warning.ozbiljnost === opcija.value && { 
                  backgroundColor: 
                    opcija.value === 'visoka' ? '#fecaca' : 
                    opcija.value === 'umjerena' ? '#fef3c7' : '#dbeafe'
                }
              ]}
              onPress={() => setWarning({...warning, ozbiljnost: opcija.value})}
            >
              <Text style={styles.ozbiljnostText}>{opcija.naziv}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Icon selection */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Ikona:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.iconScroll}
        >
          {ikonaOpcije.map((opcija) => (
            <TouchableOpacity
              key={opcija.value}
              style={[
                styles.iconOption,
                warning.ikona === opcija.value && styles.selectedIcon
              ]}
              onPress={() => setWarning({...warning, ikona: opcija.value})}
            >
              <MaterialCommunityIcons 
                name={opcija.value} 
                size={28} 
                color={warning.ikona === opcija.value ? (
                  warning.ozbiljnost === 'visoka' ? '#dc2626' : 
                  warning.ozbiljnost === 'umjerena' ? '#f59e0b' : '#3b82f6'
                ) : '#4a5568'} 
              />
              <Text style={styles.iconText}>{opcija.naziv}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Submit button */}
      <TouchableOpacity 
        style={[
          styles.saveButton,
          editingIndex !== null && { backgroundColor: '#f59e0b' }
        ]} 
        onPress={saveWarning}
      >
        <Text style={styles.saveButtonText}>
          {editingIndex !== null ? 'Ažuriraj upozorenje' : 'Sačuvaj upozorenje'}
        </Text>
        <MaterialCommunityIcons 
          name={editingIndex !== null ? "pencil" : "content-save"} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
      
      {/* List of existing warnings */}
      {allWarnings.length > 0 && (
        <View style={styles.existingWarningsContainer}>
          <Text style={styles.secondaryTitle}>Postojeća upozorenja ({allWarnings.length})</Text>
          <FlatList
            data={allWarnings}
            renderItem={renderWarningItem}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16
  },
  naslov: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 24,
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12,
    marginRight: 8
  },
  timeInput: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#2d3748'
  },
  preporukaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  preporukaInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16
  },
  removePreporukaButton: {
    marginLeft: 10
  },
  addPreporukaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  addPreporukaText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#48bb78',
    fontWeight: '500'
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  ozbiljnostOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4
  },
  selectedOzbiljnost: {
    borderWidth: 2,
    borderColor: '#2b6cb0'
  },
  ozbiljnostText: {
    fontSize: 16,
    fontWeight: '500'
  },
  iconScroll: {
    flexDirection: 'row'
  },
  iconOption: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    width: 100,
    backgroundColor: '#fff'
  },
  selectedIcon: {
    borderWidth: 2,
    borderColor: '#2b6cb0',
    backgroundColor: '#ebf4ff'
  },
  iconText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center'
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2b6cb0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500'
  },
  existingWarningsContainer: {
    marginTop: 20
  },
  secondaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12
  },
  warningItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6'
  },
  warningContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1
  },
  warningDate: {
    fontSize: 14,
    color: '#4a5568',
    marginRight: 8
  },
  deleteButton: {
    padding: 4
  }
});

export default AdminWarnings;