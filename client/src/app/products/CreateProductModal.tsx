import React from 'react';
import { v4 } from 'uuid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Header from '@/app/(components)/Header';

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const CreateProductModal = ({ isOpen, onClose, onCreate }: CreateProductModalProps) => {
  const handleOnClose = () => {
    onClose();
    formik.resetForm();
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Product name is required'),
    price: Yup.number().required('Price is required').positive('Price must be positive'),
    stockQuantity: Yup.number()
      .required('Stock quantity is required')
      .min(0, 'Stock quantity cannot be negative'),
    rating: Yup.number()
      .required('Rating is required')
      .min(0, 'Rating cannot be negative')
      .max(5, 'Rating cannot exceed 5'),
  });

  const formik = useFormik({
    initialValues: {
      productId: v4(),
      name: '',
      price: 0,
      stockQuantity: 0,
      rating: 0,
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => {
      onCreate(values);
      handleOnClose();
    },
  });

  if (!isOpen) {
    return null;
  }

  const labelCssStyles = 'block text-sm font-medium text-gray-700 mb-1';
  const inputCssStyles =
    'block w-full mb-2 p-3 border-gray-300 border-2 rounded-md focus:outline-none text-gray-500';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-200">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Product" />
        <form onSubmit={formik.handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label htmlFor="productName" className={labelCssStyles}>
            Product Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={formik.handleChange}
            value={formik.values.name}
            className={inputCssStyles}
            required
          />
          {formik.errors.name && <div className="text-red-600 mb-4">{formik.errors.name}</div>}

          {/* PRODUCT PRICE */}
          <label htmlFor="productPrice" className={labelCssStyles}>
            Price
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            onChange={formik.handleChange}
            value={formik.values.price}
            className={inputCssStyles}
            required
          />
          {formik.errors.price && <div className="text-red-600 mb-4">{formik.errors.price}</div>}

          {/* PRODUCT STOCK QUANTITY */}
          <label htmlFor="stockQuantity" className={labelCssStyles}>
            Stock Quantity
          </label>
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            onChange={formik.handleChange}
            value={formik.values.stockQuantity}
            className={inputCssStyles}
            required
          />
          {formik.errors.stockQuantity && (
            <div className="text-red-600 mb-4">{formik.errors.stockQuantity}</div>
          )}

          {/* PRODUCT RATING */}
          <label htmlFor="productRating" className={labelCssStyles}>
            Rating
          </label>
          <input
            type="number"
            name="rating"
            placeholder="Rating"
            onChange={formik.handleChange}
            value={formik.values.rating}
            className={inputCssStyles}
            required
          />
          {formik.errors.rating && <div className="text-red-600 mb-4">{formik.errors.rating}</div>}

          {/* CREATE ACTIONS */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200" // Updated button styles
            >
              Create
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition duration-200" // Updated button styles
              onClick={handleOnClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
