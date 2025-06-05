import React from 'react';
import Header from '../Header/index';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type PaymentModalProps = {
  isOpen: boolean;
  userEmail?: string;
  userName?: string;
};

const PaymentModal = ({ isOpen, userEmail = '', userName = '' }: PaymentModalProps) => {
  if (!isOpen) return null;

  const handleSubscribeClick = () => {
    const checkoutUrl = `https://buy.stripe.com/test_14A8wR0Y57IC8ha7pHbwk00?prefilled_email=${userEmail}&prefilled_name=${userName}`;
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <Header name="Premium Expenses Feature" />

        <div className="mt-4 space-y-4">
          <p className="text-gray-600">Unlock powerful expense tracking and analytics features:</p>

          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Advanced expense categorization
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Visual analytics and charts
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Date-based filtering
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Export and reporting
            </li>
          </ul>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-blue-800">Premium Plan</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              $9.99<span className="text-sm font-normal text-gray-600">/month</span>
            </p>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSubscribeClick}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
