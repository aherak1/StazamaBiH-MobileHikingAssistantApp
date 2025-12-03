// services/ImageStorageService.js
import * as FileSystem from 'expo-file-system';

class ImageStorageService {
  constructor() {
    this.imageDirectory = FileSystem.documentDirectory + 'event_images/';
    this.ensureDirectoryExists();
  }

  // Osigurava da direktorij za slike postoji
  async ensureDirectoryExists() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.imageDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.imageDirectory, { 
          intermediateDirectories: true 
        });
      }
    } catch (error) {
      console.error('Greška pri kreiranju direktorija:', error);
    }
  }

  // Sprema sliku u trajni direktorij
  async saveImage(imageUri, eventId, imageIndex) {
    try {
      const filename = `event_${eventId}_image_${imageIndex}_${Date.now()}.jpg`;
      const newPath = this.imageDirectory + filename;
      
      // Kopiramo sliku iz privremene lokacije u trajnu
      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath
      });
      
      return newPath;
    } catch (error) {
      console.error('Greška pri spremanju slike:', error);
      return null;
    }
  }

  // Sprema sve slike za događaj
  async saveEventImages(imageUris, eventId) {
    const savedImages = [];
    
    for (let i = 0; i < imageUris.length; i++) {
      const imageUri = imageUris[i];
      
      // Preskačemo već trajno pohranjene slike
      if (imageUri.startsWith(this.imageDirectory)) {
        savedImages.push(imageUri);
        continue;
      }
      
      const savedPath = await this.saveImage(imageUri, eventId, i);
      if (savedPath) {
        savedImages.push(savedPath);
      } else {
        // Ako se slika ne može spremiti, zadržavamo placeholder
        savedImages.push('https://via.placeholder.com/300x200?text=Stazama+BiH');
      }
    }
    
    return savedImages;
  }

  // Briše slike događaja
  async deleteEventImages(imageUris) {
    for (const imageUri of imageUris) {
      try {
        if (imageUri.startsWith(this.imageDirectory)) {
          const fileInfo = await FileSystem.getInfoAsync(imageUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(imageUri);
          }
        }
      } catch (error) {
        console.error('Greška pri brisanju slike:', error);
      }
    }
  }

  // Provjerava da li slika postoji
  async imageExists(imageUri) {
    try {
      if (!imageUri.startsWith(this.imageDirectory)) {
        return true; // Vanjski URL-ovi se smatraju valjani
      }
      
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }

  // Čisti nepostojeće slike iz liste
  async cleanImageList(imageUris) {
    const validImages = [];
    
    for (const imageUri of imageUris) {
      const exists = await this.imageExists(imageUri);
      if (exists) {
        validImages.push(imageUri);
      }
    }
    
    // Ako nema valjanih slika, dodaj placeholder
    if (validImages.length === 0) {
      validImages.push('https://via.placeholder.com/300x200?text=Stazama+BiH');
    }
    
    return validImages;
  }
}

export default new ImageStorageService();