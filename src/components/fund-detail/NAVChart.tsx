import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { NAVEntry } from '@/types/fund';
import { downsampleNAVData } from '@/utils/chart';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface NAVChartProps {
  data: NAVEntry[];
  maxPoints?: number;
}

const DEFAULT_MAX_POINTS = 80;
const CHART_HEIGHT = 200;

function NAVChartInner({ data, maxPoints = DEFAULT_MAX_POINTS }: NAVChartProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  if (data.length === 0) {
    return null;
  }

  // Data from API is newest-first; reverse to get oldest-first (left = oldest, right = newest)
  const chronological = [...data].reverse();

  // Downsample for chart performance
  const sampled = downsampleNAVData(chronological, maxPoints);

  // Map to format expected by gifted-charts
  const chartData = sampled.map((entry) => ({
    value: parseFloat(entry.nav),
  }));

  // Responsive width: full window width minus horizontal padding
  const chartWidth = windowWidth - Spacing.three * 2;

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={CHART_HEIGHT}
        color={theme.text}
        thickness={1.5}
        hideDataPoints
        yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
        yAxisColor={theme.backgroundSelected}
        xAxisColor={theme.backgroundSelected}
        hideRules
        backgroundColor={theme.background}
        adjustToWidth
        disableScroll
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});

export const NAVChart = React.memo(NAVChartInner);
