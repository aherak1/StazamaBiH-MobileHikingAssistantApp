import React, { useState } from 'react';
import { View, Text, Button, Picker, Slider, Switch } from 'react-native';

const FiltersAndSorting = ({ accommodations, setFilteredAccommodations }) => {
  const [sortType, setSortType] = useState('rating');
  const [filters, setFilters] = useState({
    type: '', // npr. 'hotel', 'apartment'
    minPrice: 0,
    maxPrice: 1000,
    amenities: [],
    starRating: 0
  });

  const applyFiltersAndSorting = () => {
    // Prvo sortiraj
    const sortedAccommodation = sortAccommodation(accommodations, sortType);

    // Zatim filtriraj
    const filteredAccommodation = filterAccommodation(sortedAccommodation, filters);
    
    // Postavi rezultate
    setFilteredAccommodations(filteredAccommodation);
  };

  return (
    <View>
      {/* Sortiranje */}
      <Text>Sortiraj po:</Text>
      <Picker selectedValue={sortType} onValueChange={setSortType}>
        <Picker.Item label="Najviša ocjena" value="rating" />
        <Picker.Item label="Najviše rezervisano" value="reserved" />
        <Picker.Item label="Dostupnost" value="availability" />
      </Picker>

      {/* Filtriranje */}
      <Text>Filtriraj po vrsti smještaja:</Text>
      <Picker
        selectedValue={filters.type}
        onValueChange={type => setFilters({ ...filters, type })}
      >
        <Picker.Item label="Svi tipovi" value="" />
        <Picker.Item label="Hotel" value="hotel" />
        <Picker.Item label="Apartman" value="apartment" />
        {/* Dodajte više opcija */}
      </Picker>

      <Text>Cijena:</Text>
      <Text>Minimalna cijena: {filters.minPrice}</Text>
      <Slider
        minimumValue={0}
        maximumValue={1000}
        value={filters.minPrice}
        onValueChange={minPrice => setFilters({ ...filters, minPrice })}
      />
      <Text>Maksimalna cijena: {filters.maxPrice}</Text>
      <Slider
        minimumValue={0}
        maximumValue={1000}
        value={filters.maxPrice}
        onValueChange={maxPrice => setFilters({ ...filters, maxPrice })}
      />

      <Text>Filtriraj prema zvjezdicama:</Text>
      <Slider
        minimumValue={1}
        maximumValue={5}
        value={filters.starRating}
        onValueChange={starRating => setFilters({ ...filters, starRating })}
      />

      <Button title="Primjeni" onPress={applyFiltersAndSorting} />
    </View>
  );
};

export default FiltersAndSorting;
