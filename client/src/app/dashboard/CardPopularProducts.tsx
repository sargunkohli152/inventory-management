import React from 'react';
import Rating from '../(components)/Rating/index';
import { useGetDashboardMetricsQuery } from '@/state/api';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  const getRandomImage = () => {
    const random = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    return `/images/products/product${random}.png`;
  };

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">Popular Products</h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3">
                  <Image
                    src={getRandomImage()}
                    alt={product.name}
                    height={47}
                    width={47}
                    className="rounded-lg w-14 h-14"
                  />
                  <div className="flex flex-col justify-between gap-1">
                    <div className="font-bold text-gray-700">{product.name}</div>
                    <div className="flex text-sm items-center">
                      <span className="font-bold text-blue-500 text-xs">${product.price}</span>
                      <span className="mx-2">|</span>
                      <Rating rating={product?.rating ?? 0} />
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="text-xs flex items-center font-semibold">
                  <button className="p-2 rounded-full bg-blue-100 text-blue-600 mr-2">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  {Math.round(product.stockQuantity / 1000)}k sold
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
