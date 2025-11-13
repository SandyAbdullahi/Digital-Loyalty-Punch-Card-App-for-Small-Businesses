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
  const visitChartOptions = {
    chart: { type: 'bar' as const, height: 250 },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Baseline Visits', 'Extra Visits'] },
    yaxis: { title: { text: 'Visits' } },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(1)} visits` },
    },
    colors: ['#0EA5E9', '#10B981'],
  };

  const revenueChartOptions = {
    chart: { type: 'bar' as const, height: 250 },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: ['Estimated Revenue', 'Cost', 'Net Revenue'] },
    yaxis: { title: { text: 'Amount (KES)' } },
    tooltip: {
      y: { formatter: (val: number) => `KES ${val.toFixed(2)}` },
    },
    colors: ['#16A34A', '#EF4444', '#0EA5E9'],
  };

  const visitSeries = [
    {
      name: 'Visits',
      data: [data.baselineVisits, data.estimatedExtraVisits],
    },
  ];

  const revenueSeries = [
    {
      name: 'Amount (KES)',
      data: [
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
      <Text size="sm" c="dimmed" mb="xs">
        Visits vs Baseline
      </Text>
      <ReactApexChart options={visitChartOptions} series={visitSeries} type="bar" height={250} />
      <Text size="sm" c="dimmed" mt="lg" mb="xs">
        Revenue vs Cost (KES)
      </Text>
      <ReactApexChart
        options={revenueChartOptions}
        series={revenueSeries}
        type="bar"
        height={250}
      />
    </Card>
  );
};

export default RevenueChart;
