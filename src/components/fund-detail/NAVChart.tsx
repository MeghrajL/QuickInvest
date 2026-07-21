import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { BorderRadius } from "@/constants/theme";
import { NAVEntry } from "@/types/fund";
import { downsampleNAVData } from "@/utils/chart";
import { parseNAVDate } from "@/utils/date";

interface NAVChartProps {
  data: NAVEntry[];
  maxPoints?: number;
}

const CHART_HEIGHT = 160;
const Y_AXIS_WIDTH = 45;

function NAVChartInner({ data, maxPoints = 20 }: NAVChartProps) {
  const { width: windowWidth } = useWindowDimensions();

  const availableDataWidth = windowWidth - 32 - Y_AXIS_WIDTH - 30;

  const { chartData, yAxisOffset, maxValue, spacing } = useMemo(() => {
    if (data.length === 0)
      return { chartData: [], yAxisOffset: 0, maxValue: 0, spacing: 0 };

    const chronological = [...data].reverse();
    const sampled = downsampleNAVData(chronological, maxPoints);

    const pointSpacing = availableDataWidth / Math.max(sampled.length - 1, 1);

    let minNav = Infinity;
    let maxNav = -Infinity;
    const values = sampled.map((entry) => {
      const val = parseFloat(entry.nav);
      if (val < minNav) minNav = val;
      if (val > maxNav) maxNav = val;
      return val;
    });

    const range = maxNav - minNav || 1;
    const padding = range * 0.1;
    const offset = Math.max(0, Math.floor(minNav - padding));
    const topValue = Math.ceil(maxNav + padding) - offset;

    // 5 labels at 0%, 25%, 50%, 75%, 100%
    const positions = [
      0,
      Math.floor(sampled.length * 0.25),
      Math.floor(sampled.length * 0.5),
      Math.floor(sampled.length * 0.75),
      sampled.length - 1,
    ];
    const labelIndices = new Set(positions);

    // Determine date range
    const firstDate = parseNAVDate(sampled[0].date);
    const lastDate = parseNAVDate(sampled[sampled.length - 1].date);
    const yearSpan = lastDate.getFullYear() - firstDate.getFullYear();
    const monthSpan =
      yearSpan * 12 + (lastDate.getMonth() - firstDate.getMonth());

    const chartDataResult = sampled.map((entry, index) => {
      const date = parseNAVDate(entry.date);

      let label = "";
      if (labelIndices.has(index)) {
        if (yearSpan > 3) {
          // Multi-year: just show year
          label = date.getFullYear().toString();
        } else if (monthSpan > 6) {
          // 6M-3Y: "MMM 'YY"
          const month = date.toLocaleString("default", { month: "short" });
          label = `${month} '${date.getFullYear().toString().slice(2)}`;
        } else {
          // Under 6M: "dd MMM" to avoid duplicate month names
          const day = date.getDate();
          const month = date.toLocaleString("default", { month: "short" });
          label = `${day} ${month}`;
        }
      }

      // Align: first label left, last label right, middle labels center
      let textAlign: "left" | "center" | "right" = "center";
      let marginLeft = -20;
      if (index === 0) {
        textAlign = "left";
        marginLeft = 0;
      } else if (index === sampled.length - 1) {
        textAlign = "right";
        marginLeft = -40;
      }

      return {
        value: values[index],
        label,
        labelTextStyle: label
          ? {
              color: "#8e8e9a",
              fontSize: 9,
              width: 50,
              textAlign,
              marginLeft,
            }
          : undefined,
      };
    });

    return {
      chartData: chartDataResult,
      yAxisOffset: offset,
      maxValue: topValue,
      spacing: pointSpacing,
    };
  }, [data, maxPoints, availableDataWidth]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        height={CHART_HEIGHT}
        spacing={spacing}
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
        yAxisOffset={yAxisOffset}
        maxValue={maxValue}
        noOfSections={4}
        formatYLabel={(label) => parseFloat(label).toFixed(2)}
        hideRules
        backgroundColor="transparent"
        disableScroll
        curved
        initialSpacing={10}
        endSpacing={5}
        xAxisLabelsHeight={20}
        labelsExtraHeight={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
  },
});

export const NAVChart = React.memo(NAVChartInner);
