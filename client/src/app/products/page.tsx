'use client';

import React, { useState } from 'react';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
} from '@/state/api';
import { PlusCircleIcon, SearchIcon } from 'lucide-react';
import Header from '@/app/(components)/Header';
import Rating from '@/app/(components)/Rating';
import CreateProductModal from './CreateProductModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteProductModal from './DeleteProductModal';
import Image from 'next/image';

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalInfo, setDeleteModalInfo] = useState({
    isDeleteModalOpen: false,
    productId: '',
  });

  const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm);

  const [createProduct] = useCreateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await createProduct(productData);
      toast.success('Product created successfully');
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct({ productId });
      toast.success('Product deleted successfully');
    } catch (error: any) {
      if (error.status === 404) {
        toast.error('Product not found');
      } else {
        toast.error('Failed to delete product due to server error');
      }
    } finally {
      setDeleteModalInfo({
        isDeleteModalOpen: false,
        productId: '',
      });
    }
  };

  const getRandomImage = () => {
    const random = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    return `/images/products/product${random}.png`;
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return <div className="py-4 text-center text-red-500">Failed to fetch products</div>;
  }

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 rounded-lg bg-white focus:outline-none"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 text-gray-200" />
          Create Product
        </button>
      </div>

      {/* BODY PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          products?.map((product) => (
            <div
              key={product.productId}
              className="border shadow rounded-md p-4 max-w-full w-full mx-auto"
            >
              <div className="flex flex-col items-center">
                <Image
                  src={getRandomImage()}
                  alt={product.name}
                  height={150}
                  width={150}
                  className="mb-3 rounded-2xl w-36 h-36"
                />
                <h3 className="text-lg text-gray-900 font-semibold">{product.name}</h3>
                <p className="text-gray-300">${product.price.toFixed(2)}</p>
                <div className="text-sm text-gray-600 mt-1">Stock: {product.stockQuantity}</div>
                {product.rating && (
                  <div className="flex items-center mt-2">
                    <Rating rating={product.rating} />
                  </div>
                )}
                {/* DELETE BUTTON */}
                <button
                  className="mt-4 bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded"
                  onClick={() =>
                    setDeleteModalInfo({ isDeleteModalOpen: true, productId: product.productId })
                  }
                >
                  Delete Product
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer />

      {/* MODALS */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />

      <DeleteProductModal
        deleteModalInfo={deleteModalInfo}
        onClose={() => setDeleteModalInfo({ isDeleteModalOpen: false, productId: '' })}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default Products;
