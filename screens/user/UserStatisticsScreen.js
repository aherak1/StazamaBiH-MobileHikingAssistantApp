import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/bs';

moment.locale('bs', {
  months: [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ]
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: () => '#4A90E2',
  labelColor: () => '#2D3436',
  barPercentage: 0.5,
  propsForBackgroundLines: {
    strokeWidth: 0.5,
    stroke: '#e0e0e0',
    strokeDashArray: [5, 3],
  },
  propsForLabels: {
    fontSize: 11
  }
};

const COLORS = ['#4A90E2', '#FFD700', '#34C759', '#FF6B6B', '#9B59B6', '#1ABC9C'];

const ChartContainer = ({ title, icon, children, isEmpty, iconColor = '#4A90E2' }) => (
  <View style={styles.chartContainer}>
    <View style={styles.header}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
    </View>
    {isEmpty ? <Text style={styles.emptyText}>Nema podataka</Text> : children}
  </View>
);

const UserStatisticsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalReservations: 0,
    avgRating: 0,
    mostVisitedTrail: null
  });
  const [currentUser, setCurrentUser] = useState(null);

  const processReservations = (reservations, currentUser) => {
    // Filtriraj rezervacije za trenutnog korisnika
    const userReservations = reservations.filter(
      res => res.firstName === currentUser.firstName && res.lastName === currentUser.lastName
    );
    
    const total = userReservations.length;
    const monthData = userReservations.reduce((acc, { startDate }) => {
      const month = moment(startDate).format('MMMM YYYY');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthData).sort((a, b) => 
      moment(a, 'MMMM YYYY') - moment(b, 'MMMM YYYY')
    );

    return {
      total,
      chartData: {
        labels: sortedMonths,
        datasets: [{ data: sortedMonths.map(m => monthData[m]) }]
      }
    };
  };

  const processRatings = (comments, currentUser) => {
    // Filtriraj komentare za trenutnog korisnika
    const userComments = comments.filter(
      comment => comment.korisnik === `${currentUser.firstName} ${currentUser.lastName}`
    );
    
    const ratingData = userComments.reduce((acc, { name, rating }) => {
      if (!name || !rating) return acc;
      
      if (!acc[name]) {
        acc[name] = { sum: 0, count: 0 };
      }
      acc[name].sum += Number(rating);
      acc[name].count++;
      return acc;
    }, {});

    const sorted = Object.entries(ratingData)
      .map(([name, { sum, count }]) => ({
        name,
        average: sum / count
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);

    const avgRating = userComments.length > 0 ? 
      userComments.reduce((sum, { rating }) => sum + (Number(rating) || 0), 0) / userComments.length : 0;

    return {
      avgRating: parseFloat(avgRating.toFixed(1)),
      chartData: {
        labels: sorted.map(item => item.name),
        datasets: [{
          data: sorted.map(item => parseFloat(item.average.toFixed(1)))
        }]
      }
    };
  };

  const processVisitedTrails = (trails, currentUser) => {
    // Filtriraj staze za trenutnog korisnika
    const userTrails = trails.filter(
      trail => trail.korisnik === `${currentUser.firstName} ${currentUser.lastName}`
    );
    
    const trailData = userTrails.reduce((acc, { naziv, mountainName }) => {
      const key = naziv || mountainName;
      if (!key) return acc;
      
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(trailData)
      .sort((a, b) => b[1] - a[1]);

    const mostVisited = sorted.length > 0 ? {
      name: sorted[0][0],
      count: sorted[0][1]
    } : null;

    const chartData = sorted
      .slice(0, 6)
      .map(([name, count], index) => ({
        name,
        count,
        color: COLORS[index % COLORS.length],
        legendFontColor: '#2D3436',
        legendFontSize: 12
      }));

    return {
      mostVisited,
      chartData
    };
  };

  const loadData = async () => {
    try {
      // Dohvati trenutnog korisnika
      const userData = await AsyncStorage.getItem('currentUser');
      if (!userData) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      const user = JSON.parse(userData);
      setCurrentUser(user);

      // Dohvati podatke
      const [reservations, comments, visitedTrails] = await Promise.all([
        AsyncStorage.getItem('reservations'),
        AsyncStorage.getItem('comment_history'),
        AsyncStorage.getItem('visitedTrails')
      ]);

      const parsedReservations = JSON.parse(reservations) || [];
      const parsedComments = JSON.parse(comments) || [];
      const parsedTrails = JSON.parse(visitedTrails) || [];

      const reservationsData = processReservations(parsedReservations, user);
      const ratingsData = processRatings(parsedComments, user);
      const trailsData = processVisitedTrails(parsedTrails, user);

      setStats({
        reservations: reservationsData.chartData,
        ratings: ratingsData.chartData,
        trails: trailsData.chartData
      });

      setSummary({
        totalReservations: reservationsData.total,
        avgRating: ratingsData.avgRating,
        mostVisitedTrail: trailsData.mostVisited
      });
    } catch (error) {
      console.error('Greška:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    loadData();
  }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  // Ako korisnik nije prijavljen, prikaži odgovarajuću poruku
  if (!currentUser) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={60} color="#95a5a6" />
        <Text style={styles.emptyText}>Molimo prijavite se da biste vidjeli vašu statistiku</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="calendar" size={20} color="#4A90E2" />
            <Text style={styles.summaryNumber}>{summary.totalReservations}</Text>
            <Text style={styles.summaryLabel}>Ukupno rezervacija</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.summaryNumber}>{summary.avgRating}</Text>
            <Text style={styles.summaryLabel}>Prosjek ocjena</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="walk" size={20} color="#34C759" />
            <Text style={styles.summaryLabel}>Najposjećenija</Text>
            <Text style={styles.summaryNumber}>
              {summary.mostVisitedTrail?.name || 'N/A'}
            </Text>
            <Text style={styles.summarySubtext}>
              {summary.mostVisitedTrail?.count || 0} posjeta
            </Text>
          </View>
        </View>

        <ChartContainer 
          title="Rezervacije po mjesecu" 
          icon="calendar" 
          isEmpty={!stats?.reservations?.labels?.length}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={stats?.reservations || { labels: [], datasets: [] }}
              width={Math.max(SCREEN_WIDTH, (stats?.reservations?.labels?.length || 0) * 70)}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero
              withInnerLines={true}
            />
          </ScrollView>
        </ChartContainer>

        <ChartContainer 
          title="Prosječne ocjene" 
          icon="star" 
          iconColor="#FFD700"
          isEmpty={!stats?.ratings?.labels?.length}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={stats?.ratings || { labels: [], datasets: [] }}
              width={Math.max(SCREEN_WIDTH, (stats?.ratings?.labels?.length || 0) * 100)}
              height={220}
              chartConfig={{ ...chartConfig, color: () => '#FFA500' }}
              verticalLabelRotation={0}
              fromZero
              withInnerLines={true}
            />
          </ScrollView>
        </ChartContainer>

        <ChartContainer 
          title="Popularnost ruta" 
          icon="map" 
          iconColor="#34C759"
          isEmpty={!stats?.trails?.length}
        >
          <View style={styles.pieChartWrapper}>
            <PieChart
              data={stats?.trails || []}
              width={SCREEN_WIDTH - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={false}
              absolute
              center={[(SCREEN_WIDTH - 40) / 4, 0]}
            />
            <View style={styles.legendContainer}>
              {stats?.trails?.map((trail, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: trail.color }]} />
                  <Text style={styles.legendText}>
                    {trail.name} ({trail.count})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ChartContainer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 5
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginVertical: 4
  },
  summaryLabel: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center'
  },
  summarySubtext: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2D3436'
  },
  emptyText: {
    color: '#718096',
    textAlign: 'center',
    marginVertical: 12
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 12
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    color: '#2D3436'
  }
});

export default UserStatisticsScreen;