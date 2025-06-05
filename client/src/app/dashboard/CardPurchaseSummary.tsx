import React, { useEffect, useState } from 'react';
import { useGetDashboardMetricsQuery } from '@/state/api';
import { TrendingDown, TrendingUp } from 'lucide-react';
import numeral from 'numeral';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useAppSelector } from '../redux';

const CardPurchaseSummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const purchaseData = data?.purchaseSummary || [];

  const [screenDimension, setScreenDimension] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        setScreenDimension('lg');
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        setScreenDimension('md');
      } else {
        setScreenDimension('sm');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lastDataPoint = purchaseData[purchaseData.length - 1] ?? null;

  Highcharts.setOptions({
    credits: {
      enabled: false,
    },
  });

  const options = {
    chart: {
      type: 'area',
      height: 250,
      backgroundColor: 'transparent',
      spacing: [-10, 20, screenDimension === 'lg' ? 120 : 20, 20],
    },
    title: {
      text: '',
    },
    xAxis: {
      categories: purchaseData.map((data) =>
        new Date(data.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        })
      ),
      title: {
        text: '',
      },
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
        style: {
          color: `${isDarkMode ? '#F9FAFB' : '#111827'}`,
        },
      },
    },
    tooltip: {
      formatter: function (this: any): string {
        const { x, y } = this;
        const date = new Date(x);
        if (isNaN(date.getTime())) {
          return 'Invalid date';
        }
        return `<b>${date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}</b>: $${y.toLocaleString('en-US')}`;
      },
    },
    series: [
      {
        name: `<span style="color: ${isDarkMode ? '#F9FAFB' : '#111827'};">Total Purchased</span>`,
        data: purchaseData.map((data) => data.totalPurchased),
        color: '#8884d8',
      },
    ],
    legend: {
      verticalAlign: 'top',
      align: 'right',
    },
  };

  return (
    <div className="flex flex-col justify-between row-span-2 xl:row-span-3 col-span-1 md:col-span-2 xl:col-span-1 bg-white shadow-md rounded-2xl">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <div>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">Purchase Summary</h2>
            <hr />
          </div>

          {/* BODY */}
          <div className="">
            {/* BODY HEADER */}
            <div className="mb-4 mt-4 px-7">
              <p className="text-xs text-gray-400">Purchased</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold">
                  {lastDataPoint ? numeral(lastDataPoint.totalPurchased).format('$0.00a') : '0'}
                </p>
                {lastDataPoint && (
                  <p
                    className={`text-sm ${
                      lastDataPoint.changePercentage! >= 0 ? 'text-green-500' : 'text-red-500'
                    } flex ml-3`}
                  >
                    {lastDataPoint.changePercentage! >= 0 ? (
                      <TrendingUp className="w-5 h-5 mr-1" />
                    ) : (
                      <TrendingDown className="w-5 h-5 mr-1" />
                    )}
                    {Math.abs(lastDataPoint.changePercentage!)}%
                  </p>
                )}
              </div>
            </div>
            {/* CHART */}
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
