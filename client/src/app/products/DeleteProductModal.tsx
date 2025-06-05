import React from 'react';
import Header from '@/app/(components)/Header';

type DeleteModalProps = {
  deleteModalInfo: {
    isDeleteModalOpen: boolean;
    productId: string;
  };
  onClose: () => void;
  onDelete: (productId: string) => void;
};

const DeleteProductModal = ({ deleteModalInfo, onClose, onDelete }: DeleteModalProps) => {
  const { isDeleteModalOpen, productId } = deleteModalInfo;

  if (!isDeleteModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 overflow-y-auto h-full w-full z-200">
      <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-lg bg-white">
        <Header name="Delete Product" />
        <p className="font-medium text-gray-500 mt-1">
          Are you sure you want to delete this product?
        </p>

        {/* DELETE ACTIONS */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            className="px-5 py-2 bg-red-700 text-white rounded-lg shadow hover:bg-red-900"
            onClick={() => onDelete(productId)}
          >
            Delete
          </button>
          <button
            type="button"
            className="px-5 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition duration-200"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
