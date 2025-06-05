'use client';

import { useGetProductsQuery } from '@/state/api';
import React from 'react';
import Header from '../(components)/Header';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  {
    field: 'productId',
    headerName: 'ID',
    width: 350,
  },
  {
    field: 'name',
    headerName: 'Product Name',
    width: 250,
  },
  {
    field: 'price',
    headerName: 'Price',
    width: 180,
    type: 'number' as const,
    valueGetter: (row: number) => `$${row}`,
  },
  {
    field: 'rating',
    headerName: 'Rating',
    width: 180,
    type: 'number' as const,
    valueGetter: (row: number) => row ?? 'N/A',
  },
  {
    field: 'stockQuantity',
    headerName: 'Stock Quantity',
    width: 180,
    type: 'number' as const,
  },
];

const Inventory = () => {
  const { data: products, isError, isLoading } = useGetProductsQuery();

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return <div className="text-center text-red-500 py-4">Failed to fetch products</div>;
  }

  return (
    <div className="flex flex-col">
      <Header name="Inventory" />
      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className="bg-[#ffffff] shadow rounded-lg border border-gray-200 mt-5 !text-lg"
      />
    </div>
  );
};

export default Inventory;
