import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { NAVEntry } from "@/types/fund";
import { downsampleNAVData } from "@/utils/chart";

interface NAVChartProps {
  data: NAVEntry[];
  maxPoints?: number;
}

const DEFAULT_MAX_POINTS = 80;
const CHART_HEIGHT = 180;

function NAVChartInner({
  data,
  maxPoints = DEFAULT_MAX_POINTS,
}: NAVChartProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  if (data.length === 0) {
    return null;
  }

  const chronological = [...data].reverse();
  const sampled = downsampleNAVData(chronological, maxPoints);

  const chartData = sampled.map((entry) => ({
    value: parseFloat(entry.nav),
  }));

  const chartWidth = windowWidth - Spacing.four * 2 - Spacing.four * 2;

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={CHART_HEIGHT}
        color="#c9a96e"
        thickness={2}
        hideDataPoints
        startFillColor="rgba(201, 169, 110, 0.15)"
        endFillColor="rgba(201, 169, 110, 0.01)"
        startOpacity={0.3}
        endOpacity={0}
        areaChart
        yAxisTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
        yAxisColor="transparent"
        xAxisColor="transparent"
        hideRules
        backgroundColor="transparent"
        adjustToWidth
        disableScroll
        curved
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.two,
  },
});

export const NAVChart = React.memo(NAVChartInner);
