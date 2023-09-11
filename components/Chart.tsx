"use client"
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import fetchContent from '@/fetchContent';
import * as echarts from 'echarts';

function DynamicCharts() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const query = `
        {
          chartConfigurationCollection {
            items {
              chartTitle
              chartType
              xAxis
              yAxis
              chartFile {
                url
              }
            }
          }
        }
      `;

      const response = await fetchContent(query);

      const parsedChartData = response.chartConfigurationCollection.items.map((item: any) => ({
        chartTitle: item.chartTitle,
        chartType: item.chartType,
        xAxis: item.xAxis,
        yAxis: item.yAxis,
        chartFile: item.chartFile.url,
      }));

      setChartData(parsedChartData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    chartData.forEach((chartConfig) => {
      const chart = document.getElementById(chartConfig.chartTitle);
      const chartElement = chart as HTMLDivElement;
      const chartInstance = echarts.getInstanceByDom(chartElement);

      if (chartInstance) {
        chartInstance.dispose();
      }

      Papa.parse(chartConfig.chartFile, {
        download: true,
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result) => {
          const xAxisData: any[] = [];
          const seriesData: any[] = [];

          if (chartConfig.xAxis && chartConfig.yAxis) {
            xAxisData.push(...result.data.map((row: any) => row[chartConfig.xAxis]));

            chartConfig.yAxis.forEach((yAxisItem: string) => {
              console.log(`Y-Axis Data for ${chartConfig.chartTitle} - ${yAxisItem}:`, result.data.map((row: any) => row[yAxisItem]));

              seriesData.push({
                name: yAxisItem,
                type: chartConfig.chartType, // Use the chartType from the chartData
                data: result.data.map((row: any) => row[yAxisItem]),
              });
            });
          }

          const chartOptions: any = {
            title: {
              text: chartConfig.chartTitle,
            },
            tooltip: {
              trigger: 'axis',
            },
            xAxis: {
              type: 'category',
              data: xAxisData,
            },
            yAxis: {},
            series: seriesData,
          };

          const echartsInstance = echarts.init(chartElement);
          echartsInstance.setOption(chartOptions);
        },
      });
    });
  }, [chartData]);

  return (
    <div>
      {chartData.map((chartConfig) => (
        <div
          key={chartConfig.chartTitle}
          id={chartConfig.chartTitle}
          style={{ width: '100%', height: '300px', marginBottom: '20px' }}
        />
      ))}
    </div>
  );
}

export default DynamicCharts;
