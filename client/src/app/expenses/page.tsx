'use client';

import {
  ExpenseByCategorySummary,
  useGetCurrentUserQuery,
  useGetExpensesByCategoryQuery,
} from '@/state/api';
import { useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Header from '@/app/(components)/Header';
import PaymentModal from '@/app/(components)/PaymentModal';

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

type ColorPaletteType = { Office: string; Professional: string; Salaries: string };

const colorPalette: ColorPaletteType = {
  Office: '#FF6384',
  Professional: '#36A2EB',
  Salaries: '#FFCE56',
};

const Expenses = () => {
  const { data: userData } = useGetCurrentUserQuery();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const showPaymentModal = !userData?.hasAccess;
  const { data: user } = useGetCurrentUserQuery();
  const { data: expensesData, isLoading, isError } = useGetExpensesByCategoryQuery();
  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory = selectedCategory === 'All' || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate || !endDate || (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          acc[data.category] = { name: data.category, amount: 0 };
          acc[data.category].color =
            colorPalette[data.category as keyof ColorPaletteType] || '#8884d8';
          acc[data.category].amount += amount;
        }
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const classNames = {
    label: 'block text-sm font-medium text-gray-700',
    selectInput:
      'mt-1 block w-full py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md',
    filterContainer: 'w-full md:w-1/3 bg-white shadow-lg rounded-lg p-6 border border-gray-200',
    filterTitle: 'text-lg font-semibold mb-4 text-gray-800',
    filterSection: 'space-y-4',
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !expensesData) {
    return <div className="text-center text-red-500 py-4">Failed to fetch expenses</div>;
  }

  return (
    <div className="relative">
      {/* Payment Modal */}
      <PaymentModal isOpen={showPaymentModal} userEmail={user?.email} userName={user?.name} />

      {/* Blurred Content */}
      <div className={showPaymentModal ? 'filter blur-sm pointer-events-none' : ''}>
        {/* HEADER */}
        <div className="mb-5">
          <Header name="Expenses" />
          <p className="text-sm text-gray-500">A visual representation of expenses over time.</p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className={classNames.filterContainer}>
            <h3 className={classNames.filterTitle}>Filter by Category and Date</h3>
            <div className={classNames.filterSection}>
              {/* CATEGORY */}
              <div>
                <label htmlFor="category" className={classNames.label}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory ?? 'All'}
                  className={`${classNames.selectInput} bg-gray-100 px-4`}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option>All</option>
                  <option>Office</option>
                  <option>Professional</option>
                  <option>Salaries</option>
                </select>
              </div>
              {/* START DATE */}
              <div>
                <label htmlFor="start-date" className={classNames.label}>
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  name="start-date"
                  value={startDate ?? ''}
                  className={`${classNames.selectInput} bg-gray-100 px-4`}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              {/* END DATE */}
              <div>
                <label htmlFor="end-date" className={classNames.label}>
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  name="end-date"
                  value={endDate ?? ''}
                  className={`${classNames.selectInput} bg-gray-100 px-4`}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* RESET FILTERS BUTTON */}
              <button
                onClick={resetFilters}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          </div>
          {/* PIE CHART */}
          <div className="flex-grow bg-white shadow rounded-lg p-4 md:p-6">
            {aggregatedData.length === 0 ? (
              <div className="flex justify-center items-center text-red-500 text-lg font-semibold h-full w-full">
                No Data to show for the applied filters
              </div>
            ) : (
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  chart: {
                    type: 'pie',
                  },
                  title: {
                    text: 'Expenses by Category',
                  },
                  credits: {
                    enabled: false,
                  },
                  plotOptions: {
                    pie: {
                      dataLabels: {
                        enabled: true,
                        distance: 50,
                        connectorWidth: 1.75,
                        style: {
                          fontSize: '14px',
                          fontWeight: '500',
                        },
                      },
                    },
                  },
                  series: [
                    {
                      name: 'Amount',
                      data: aggregatedData.map((entry: AggregatedDataItem) => ({
                        name: entry.name,
                        y: entry.amount,
                        color: entry.color,
                      })),
                    },
                  ],
                  tooltip: {
                    pointFormat: '<b>{point.y}</b>',
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
