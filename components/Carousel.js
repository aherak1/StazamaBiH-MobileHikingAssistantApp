import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Image, 
  Text, 
  Dimensions, 
  StyleSheet 
} from 'react-native';

const { width } = Dimensions.get('window');

const Carousel = () => {
  const [aktivniSlajd, setAktivniSlajd] = useState(0);
  const scrollRef = useRef(null);

  // Primjer slika za carousel s nazivima
  const slike = [
    { id: '1', url: require('../assets/prenj.jpg'), naziv: 'Prenj' },
    { id: '2', url: require('../assets/maglic.jpg'), naziv: 'Maglić' },
    { id: '3', url: require('../assets/visočica.jpg'), naziv: 'Visočica' },
  ];

  // Automatska rotacija
  useEffect(() => {
    const interval = setInterval(() => {
      const sljedeciSlajd = (aktivniSlajd + 1) % slike.length;
      setAktivniSlajd(sljedeciSlajd);
      scrollRef.current?.scrollTo({
        x: sljedeciSlajd * width,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [aktivniSlajd]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          const slide = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setAktivniSlajd(slide);
        }}
      >
        {slike.map(slika => (
          <View key={slika.id} style={styles.slide}>
            <Image
              source={slika.url}
              style={styles.slika}
              resizeMode="cover"
            />
            <Text style={styles.naziv}>{slika.naziv}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.indikatori}>
        {slike.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indikator,
              index === aktivniSlajd && styles.aktivniIndikator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
  slide: {
    width,
    height: 200,
    position: 'relative', // Omogućava apsolutnu poziciju za tekst
  },
  slika: {
    width: '100%',
    height: '100%',
  },
  naziv: {
    position: 'absolute',
    top: 10, // Podesite razmak od vrha
    right: 10, // Podesite razmak od desnog ruba
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // Bijeli tekst
  },
  indikatori: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  indikator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 3,
  },
  aktivniIndikator: {
    backgroundColor: '#fff',
  },
});

export default Carousel;
