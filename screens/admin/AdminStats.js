import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/locale/bs'; // Promijenjeno na bosanski jezik
import { BarChart, PieChart } from 'react-native-chart-kit';

// Postavljanje bosanskog jezika kao defaultni
moment.locale('bs');

const colors = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#4299E1',
  danger: '#DC3545',
  success: '#38A169',
  warning: '#DD6B20',
  background: '#F7FAFC',
  border: '#E2E8F0',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(66, 153, 225, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(26, 32, 44, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: colors.accent,
  },
};

const screenWidth = Dimensions.get('window').width - 32;
// Širina za horizontalni skrolajući grafikon (više prostora između stupaca)
const scrollableChartWidth = Math.max(screenWidth, screenWidth * 1.5);

const AdminStats = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalComments: 0,
    totalReservations: 0,
    totalTrailVisits: 0,
    recentComments: [],
    activeUsers: [],
    popularTrails: [],
    recentReservations: [],
    commentsByMonth: [],
    reservationsByMonth: [],
    allComments: [],
    allReservations: [],
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStats);
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load all data from AsyncStorage
      const [
        commentsData,
        reservationsData,
        visitedTrailsData
      ] = await Promise.all([
        AsyncStorage.getItem('comment_history'),
        AsyncStorage.getItem('reservations'),
        AsyncStorage.getItem('visitedTrails')
      ]);

      const comments = commentsData ? JSON.parse(commentsData) : [];
      const reservations = reservationsData ? JSON.parse(reservationsData) : [];
      const trailVisits = visitedTrailsData ? JSON.parse(visitedTrailsData) : [];

      // Process comments by month
      const commentsByMonth = getDataByMonth(comments, 'timestamp');
      
      // Process reservations by month
      const reservationsByMonth = getDataByMonth(reservations, 'reservationDate');

      // Process trail visits
      const trailVisitCounts = {};
      trailVisits.forEach(visit => {
        trailVisitCounts[visit.naziv] = (trailVisitCounts[visit.naziv] || 0) + 1;
      });
      const popularTrails = Object.entries(trailVisitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Sortiranje komentara i rezervacija po datumu (najnoviji prvo)
      const sortedComments = [...comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const sortedReservations = [...reservations].sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));

      setStats({
        totalComments: comments.length,
        totalReservations: reservations.length,
        totalTrailVisits: trailVisits.length,
        recentComments: sortedComments.slice(0, 5),
        popularTrails,
        recentReservations: sortedReservations.slice(0, 5),
        commentsByMonth,
        reservationsByMonth,
        allComments: sortedComments,
        allReservations: sortedReservations,
      });
      setError(null);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Došlo je do greške pri učitavanju statistike');
    } finally {
      setLoading(false);
    }
  };

  const getDataByMonth = (data, dateField) => {
    const monthCounts = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      if (date.getFullYear() === currentYear) {
        monthCounts[date.getMonth()]++;
      }
    });
    
    return monthCounts.map((count, index) => ({
      month: moment().month(index).format('MMM'),
      count
    }));
  };

  const renderStatCard = (icon, title, value, color = colors.accent) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderRecentItem = (item, index, type) => (
    <View key={index} style={styles.recentItem}>
      <MaterialIcons 
        name={
          type === 'comment' ? 'comment' : 
          type === 'reservation' ? 'date-range' : 
          'directions-walk'
        } 
        size={16} 
        color={colors.textSecondary} 
      />
      <Text style={styles.recentText} numberOfLines={1}>
        {type === 'comment' ? `"${item.tekst.substring(0, 30)}${item.tekst.length > 30 ? '...' : ''}"` : 
         type === 'reservation' ? `${item.firstName} ${item.lastName} (${moment(item.startDate).format('DD.MM.YYYY')})` :
         `${item.name} (${item.count} posjeta)`}
      </Text>
      {type !== 'trail' && (
        <Text style={styles.recentTime}>
          {moment(type === 'comment' ? item.timestamp : item.reservationDate).fromNow()}
        </Text>
      )}
    </View>
  );

  // Uklonjeni detaljni prikazi komentara i rezervacija

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
        <MaterialCommunityIcons name="alert-circle" size={40} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Osnovna statistika</Text>
      <View style={styles.statsRow}>
        {renderStatCard('comment-text', 'Komentara', stats.totalComments, colors.success)}
        {renderStatCard('calendar-check', 'Rezervacija', stats.totalReservations, colors.accent)}
        {renderStatCard('walk', 'Posjeta stazama', stats.totalTrailVisits, colors.warning)}
      </View>

      <Text style={styles.sectionTitle}>Komentari po mjesecima ({new Date().getFullYear()})</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.horizontalChartContainer}
      >
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: stats.commentsByMonth.map(item => item.month),
              datasets: [{
                data: stats.commentsByMonth.map(item => item.count)
              }]
            }}
            width={scrollableChartWidth}
            height={220}
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(56, 161, 105, ${opacity})`,
              barPercentage: 0.6, // Manji stupci s više razmaka
            }}
            style={styles.chart}
            fromZero={true}
          />
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Rezervacije po mjesecima ({new Date().getFullYear()})</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.horizontalChartContainer}
      >
        <View style={styles.chartContainer}>
          <BarChart
            data={{
              labels: stats.reservationsByMonth.map(item => item.month),
              datasets: [{
                data: stats.reservationsByMonth.map(item => item.count)
              }]
            }}
            width={scrollableChartWidth}
            height={220}
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.6, // Manji stupci s više razmaka
            }}
            style={styles.chart}
            fromZero={true}
          />
        </View>
      </ScrollView>

      <Text style={styles.sectionTitle}>Najpopularnije staze</Text>
      <View style={[styles.chartContainer, styles.pieChartContainer]}>
        <PieChart
          data={stats.popularTrails.map((trail, index) => ({
            name: trail.name.length > 10 ? trail.name.substring(0, 10) + '...' : trail.name,
            count: trail.count,
            color: [
              colors.accent,
              colors.success,
              colors.warning,
              colors.danger,
              colors.primary
            ][index % 5],
            legendFontColor: "transparent", // Sakrivamo legende jer već imamo ispod
            legendFontSize: 0,
          }))}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="0"
          center={[screenWidth / 4, 0]} 
          absolute
          style={styles.chart}
          avoidFalseZero
          hasLegend={false} // Isključujemo legende
        />
        {/* Dodajemo dodatni prikaz legendi ispod pie charta za bolje vidljive nazive */}
        <View style={styles.legendContainer}>
          {stats.popularTrails.map((trail, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { 
                    backgroundColor: [
                      colors.accent,
                      colors.success,
                      colors.warning,
                      colors.danger,
                      colors.primary
                    ][index % 5] 
                  }
                ]} 
              />
              <Text style={styles.legendText}>{trail.name} ({trail.count})</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Uklonjene sekcije s detaljnim prikazom komentara i rezervacija */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '32%',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  horizontalChartContainer: {
    paddingRight: 16,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pieChartContainer: {
    alignItems: 'center', // Centrira pie chart
  },
  chart: {
    borderRadius: 8,
  },
  listContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  fixedHeightContainer: {
    height: 250,
  },
  flatList: {
    flex: 1,
    padding: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    marginRight: 8,
  },
  recentTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  legendContainer: {
    marginTop: 16,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
});

export default AdminStats;