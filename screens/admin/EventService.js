// services/EventService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_STORAGE_KEY = 'stazama_bih_events';

// Simple ID generator to replace uuid
const generateId = () => {
  return 'event_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '_' + new Date().getTime();
};

class EventService {
  /**
   * Dohvaća sve događaje iz AsyncStorage-a
   * @returns {Promise<Array>} Vraća listu svih događaja
   */
  static async getEvents() {
    try {
      const eventsJson = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
      return eventsJson ? JSON.parse(eventsJson) : [];
    } catch (error) {
      console.error('Greška pri dohvaćanju događaja:', error);
      throw error;
    }
  }

  /**
   * Dohvaća jedan događaj po ID-u
   * @param {string} eventId - ID događaja
   * @returns {Promise<Object|null>} Vraća događaj ili null ako nije pronađen
   */
  static async getEventById(eventId) {
    try {
      const events = await this.getEvents();
      return events.find(event => event.id === eventId) || null;
    } catch (error) {
      console.error('Greška pri dohvaćanju događaja:', error);
      throw error;
    }
  }

  /**
   * Dodaje novi događaj
   * @param {Object} eventData - Podaci o događaju
   * @returns {Promise<boolean>} Vraća true ako je uspješno dodan
   */
  static async addEvent(eventData) {
    try {
      const events = await this.getEvents();
      const newEvent = {
        ...eventData,
        id: generateId(), // Using our custom ID generator instead of uuid
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      events.push(newEvent);
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Greška pri dodavanju događaja:', error);
      throw error;
    }
  }

  /**
   * Ažurira postojeći događaj
   * @param {string} eventId - ID događaja
   * @param {Object} eventData - Novi podaci o događaju
   * @returns {Promise<boolean>} Vraća true ako je uspješno ažuriran
   */
  static async updateEvent(eventId, eventData) {
    try {
      const events = await this.getEvents();
      const index = events.findIndex(event => event.id === eventId);
      
      if (index === -1) {
        throw new Error('Događaj nije pronađen');
      }
      
      events[index] = {
        ...events[index],
        ...eventData,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Greška pri ažuriranju događaja:', error);
      throw error;
    }
  }

  /**
   * Briše događaj
   * @param {string} eventId - ID događaja za brisanje
   * @returns {Promise<boolean>} Vraća true ako je uspješno obrisan
   */
  static async deleteEvent(eventId) {
    try {
      const events = await this.getEvents();
      const filteredEvents = events.filter(event => event.id !== eventId);
      
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filteredEvents));
      return true;
    } catch (error) {
      console.error('Greška pri brisanju događaja:', error);
      throw error;
    }
  }

  /**
   * Dodaje korisnika kao učesnika događaja
   * @param {string} eventId - ID događaja
   * @param {string} userId - ID korisnika
   * @returns {Promise<boolean>} Vraća true ako je uspješno dodan
   */
  static async addParticipant(eventId, userId) {
    try {
      const events = await this.getEvents();
      const index = events.findIndex(event => event.id === eventId);
      
      if (index === -1) {
        throw new Error('Događaj nije pronađen');
      }
      
      // Provjera je li korisnik već učesnik
      if (!events[index].participants) {
        events[index].participants = [];
      }
      
      if (events[index].participants.includes(userId)) {
        return false; // Korisnik je već učesnik
      }
      
      // Provjera je li dostignut maksimalni broj učesnika
      if (events[index].maxParticipants > 0 && 
          events[index].participants.length >= events[index].maxParticipants) {
        return false; // Maksimalan broj učesnika je dostignut
      }
      
      events[index].participants.push(userId);
      events[index].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Greška pri dodavanju učesnika:', error);
      throw error;
    }
  }

  /**
   * Uklanja korisnika iz učesnika događaja
   * @param {string} eventId - ID događaja
   * @param {string} userId - ID korisnika
   * @returns {Promise<boolean>} Vraća true ako je uspješno uklonjen
   */
  static async removeParticipant(eventId, userId) {
    try {
      const events = await this.getEvents();
      const index = events.findIndex(event => event.id === eventId);
      
      if (index === -1) {
        throw new Error('Događaj nije pronađen');
      }
      
      if (!events[index].participants) {
        return false; // Nema učesnika
      }
      
      events[index].participants = events[index].participants.filter(id => id !== userId);
      events[index].updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('Greška pri uklanjanju učesnika:', error);
      throw error;
    }
  }

  /**
   * Vraća listu nadolazećih događaja
   * @returns {Promise<Array>} Vraća listu nadolazećih događaja
   */
  static async getUpcomingEvents() {
    try {
      const events = await this.getEvents();
      const now = new Date();
      
      return events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= now;
      }).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    } catch (error) {
      console.error('Greška pri dohvaćanju nadolazećih događaja:', error);
      throw error;
    }
  }

  /**
   * Vraća listu prošlih događaja
   * @returns {Promise<Array>} Vraća listu prošlih događaja
   */
  static async getPastEvents() {
    try {
      const events = await this.getEvents();
      const now = new Date();
      
      return events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate < now;
      }).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)); // Sortiranje od najnovijeg prema najstarijem
    } catch (error) {
      console.error('Greška pri dohvaćanju prošlih događaja:', error);
      throw error;
    }
  }
}

export default EventService;