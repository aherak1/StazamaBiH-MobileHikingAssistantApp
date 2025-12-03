import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Image, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const EventCarousel = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % images.length;
      setCurrentSlide(nextSlide);
      scrollRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    }, 2000); // Svaka 2 sekunde automatski menja slajd

    return () => clearInterval(interval);
  }, [currentSlide, images.length]);

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          const slide = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentSlide(slide);
        }}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image source={image} style={styles.image} resizeMode="cover" />
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicators}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === currentSlide && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    height: 200,
  },
  slide: {
    width,
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  indicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 3,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
});

export default EventCarousel;