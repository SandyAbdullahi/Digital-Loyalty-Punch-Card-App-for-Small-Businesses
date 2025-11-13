import { Card, Text } from '@mantine/core';
import ReactApexChart from 'react-apexcharts';

type RevenueChartProps = {
  data: {
    baselineVisits: number;
    estimatedExtraVisits: number;
    estimatedExtraRevenueKES: number;
    totalRewardCostKES: number;
    netIncrementalRevenueKES: number;
  };
};

const RevenueChart = ({ data }: RevenueChartProps) => {
  const options = {
    chart: {
      type: 'bar' as const,
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded' as const,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Baseline Visits', 'Extra Visits', 'Revenue', 'Cost', 'Net Revenue'],
    },
    yaxis: {
      title: {
        text: 'Amount (KES)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toFixed(2)} KES`,
      },
    },
  };

  const series = [
    {
      name: 'Amount',
      data: [
        data.baselineVisits,
        data.estimatedExtraVisits,
        data.estimatedExtraRevenueKES,
        data.totalRewardCostKES,
        data.netIncrementalRevenueKES,
      ],
    },
  ];

  return (
    <Card withBorder padding="lg">
      <Text size="lg" fw={600} mb="md">
        Revenue Estimation Breakdown
      </Text>
      <ReactApexChart options={options} series={series} type="bar" height={350} />
    </Card>
  );
};

export default RevenueChart;