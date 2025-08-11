import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  clicks: number[];
  conversions: number[];
}

interface ChartComponentProps {
  data: ChartData;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ data }) => {
  // For web, render a simple bar chart using CSS
  if (Platform.OS === 'web') {
    const maxValue = Math.max(...data.clicks, ...data.conversions);
    
    return (
      <View style={styles.webChart}>
        <View style={styles.chartContainer}>
          {data.labels.map((label, index) => (
            <View key={label} style={styles.barGroup}>
              <View style={styles.barsContainer}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar,
                      styles.clickBar,
                      { height: `${(data.clicks[index] / maxValue) * 100}%` }
                    ]} 
                  />
                </View>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar,
                      styles.conversionBar,
                      { height: `${(data.conversions[index] / maxValue) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.barLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.clickBar, { marginRight: 5 }]} />
            <Text>Clicks</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.conversionBar, { marginRight: 5 }]} />
            <Text>Conversions</Text>
          </View>
        </View>
      </View>
    );
  }
  
  // For mobile, use the LineChart (will be lazy loaded)
  try {
    const { LineChart } = require('react-native-chart-kit');
    
    const chartData = {
      labels: data.labels,
      datasets: [
        {
          data: data.clicks,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: data.conversions,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
    
    return (
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#ffa726',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    );
  } catch (error) {
    // Fallback if chart library is not available
    return (
      <View style={styles.fallbackChart}>
        <Text>Chart visualization not available</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  webChart: {
    padding: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 20,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
  },
  barWrapper: {
    width: 20,
    height: '100%',
    marginHorizontal: 2,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  clickBar: {
    backgroundColor: '#8641f4',
  },
  conversionBar: {
    backgroundColor: '#22c55e',
  },
  barLabel: {
    fontSize: 10,
    marginTop: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  fallbackChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
});