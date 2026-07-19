import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { BorderRadius, Spacing } from "@/constants/theme";
import { NAVEntry } from "@/types/fund";
import { downsampleNAVData } from "@/utils/chart";
import { parseNAVDate } from "@/utils/date";

interface NAVChartProps {
  data: NAVEntry[];
  maxPoints?: number;
}

const DEFAULT_MAX_POINTS = 60;
const CHART_HEIGHT = 180;
const Y_AXIS_WIDTH = 50;

function NAVChartInner({
  data,
  maxPoints = DEFAULT_MAX_POINTS,
}: NAVChartProps) {
  const { width: windowWidth } = useWindowDimensions();

  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const chronological = [...data].reverse();
    const sampled = downsampleNAVData(chronological, maxPoints);

    // Add x-axis labels at intervals (show ~5 date labels)
    const labelInterval = Math.max(1, Math.floor(sampled.length / 5));

    return sampled.map((entry, index) => {
      const date = parseNAVDate(entry.date);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear().toString().slice(2);
      const showLabel = index % labelInterval === 0;

      return {
        value: parseFloat(entry.nav),
        label: showLabel ? `${month} '${year}` : "",
        labelTextStyle: {
          color: "#8e8e9a",
          fontSize: 9,
          width: 40,
        },
      };
    });
  }, [data, maxPoints]);

  if (chartData.length === 0) {
    return null;
  }

  // Width: screen - card margins(16*2) - card padding(24*2) - yAxisWidth - extra safety
  const chartWidth = windowWidth - 32 - 48 - Y_AXIS_WIDTH - 16;

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
        yAxisTextStyle={{ color: "#8e8e9a", fontSize: 10 }}
        yAxisColor="transparent"
        xAxisColor="transparent"
        yAxisLabelWidth={Y_AXIS_WIDTH}
        hideRules
        noOfSections={4}
        backgroundColor="transparent"
        disableScroll
        curved
        initialSpacing={8}
        endSpacing={8}
        xAxisLabelTextStyle={{ color: "#8e8e9a", fontSize: 9 }}
        rotateLabel
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: BorderRadius.md,
    paddingRight: Spacing.two,
  },
});

export const NAVChart = React.memo(NAVChartInner);
