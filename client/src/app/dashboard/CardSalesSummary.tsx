import { useGetDashboardMetricsQuery } from '@/state/api';
import { TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useAppSelector } from '../redux';

const CardSalesSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const salesData = data?.salesSummary ?? [];

  const [timeframe, setTimeframe] = useState('weekly');

  const totalValueSum = salesData.reduce((acc, curr) => acc + curr.totalValue, 0) ?? 0;

  const averageChangePercentage =
    salesData.reduce((acc, curr, _, array) => {
      return acc + curr.changePercentage! / array.length;
    }, 0) ?? 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalValue > curr.totalValue ? acc : curr;
  }, salesData[0] ?? {});

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      })
    : 'N/A';

  const options = {
    chart: {
      type: 'column',
      height: 380,
      backgroundColor: 'transparent',
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: salesData.map((data) =>
        new Date(data.date).toLocaleString('default', {
          month: 'short',
          year: '2-digit',
        })
      ),
      labels: {
        style: {
          color: `${isDarkMode ? '#F9FAFB' : '#111827'}`,
        },
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        formatter: function (this: any): string {
          const { value } = this;
          return `$${(value / 1000000).toFixed(0)}m`;
        },
        style: {
          color: `${isDarkMode ? '#F9FAFB' : '#111827'}`,
        },
      },
    },
    tooltip: {
      formatter: function (this: any): string {
        const { point } = this;
        return `<b>${point.category}</b><br/>$${point.y.toLocaleString('en')}`;
      },
    },
    series: [
      {
        name: `<span style="color: ${isDarkMode ? '#F9FAFB' : '#111827'};">Total Value</span>`,
        data: salesData.map((data) => data.totalValue),
        color: '#3182ce',
      },
    ],
    legend: {
      verticalAlign: 'top',
      align: 'right',
    },
  };

  if (isError) {
    return <div className="m-5">Failed to fetch data</div>;
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Sales Summary</h2>
            <hr />
          </div>

          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">Value</p>
                <span className="text-2xl font-extrabold">
                  $
                  {(totalValueSum / 1000000).toLocaleString('en', {
                    maximumFractionDigits: 2,
                  })}
                  m
                </span>
                <span className="text-green-500 text-sm ml-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {averageChangePercentage.toFixed(2)}%
                </span>
              </div>
              <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
                value={timeframe}
                onChange={(e) => {
                  setTimeframe(e.target.value);
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {/* CHART */}
            <div className="px-7">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>

          {/* FOOTER */}
          <div>
            <hr />
            <div className="flex justify-between items-center mt-4 text-sm px-7 mb-4">
              <p>{salesData.length ?? 0} days</p>
              <p className="text-sm">
                Highest Sales Date: <span className="font-bold">{highestValueDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
