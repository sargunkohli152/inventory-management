'use client';

import { useState, useEffect } from 'react';
import { useLoginMutation, useSignupMutation } from '@/state/api';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setAuth, setAuthError } from '@/state';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '../(components)/Toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 20 characters')
    .required('Password is required'),
});

const signupSchema = loginSchema.shape({
  name: Yup.string().required('Name is required').max(15, 'Name must be less than 15 characters'),
});

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isAuthenticated = useAppSelector((state) => state.global.isAuthenticated);
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();

  useEffect(() => {
    if (isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl');
      router.push(callbackUrl ?? '/dashboard');
    }
  }, [isAuthenticated, router, searchParams]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: isLogin ? loginSchema : signupSchema,
    validateOnBlur: hasSubmitted,
    validateOnChange: hasSubmitted,
    onSubmit: async (values, { setSubmitting }) => {
      setHasSubmitted(true);
      try {
        let response;
        if (isLogin) {
          response = await login({
            email: values.email,
            password: values.password,
          }).unwrap();
        } else {
          response = await signup({
            adminUserId: uuidv4(),
            name: values.name,
            email: values.email,
            password: values.password,
          }).unwrap();
        }

        // Only store access token in Redux
        dispatch(
          setAuth({
            accessToken: response.tokens.accessToken,
          })
        );
      } catch (error: any) {
        console.error('Auth error:', error);
        let errorMessage = 'Authentication failed. Please try again.';

        if (error.status === 400) {
          errorMessage = 'Please fill in all required fields.';
        } else if (error.status === 409) {
          errorMessage = 'This email is already registered.';
        } else if (error.status === 401) {
          errorMessage = 'Invalid email or password.';
        }

        // Set error in global state
        dispatch(setAuthError(errorMessage));
        setToast({ message: errorMessage, type: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-300'
      }`}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
      <div
        className={`max-w-md w-full space-y-8 p-8 ${
          isDarkMode ? 'bg-gray-700' : 'bg-white'
        } rounded-lg shadow-2xl`}
      >
        <h2
          className={`text-center text-3xl font-extrabold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          {!isLogin && (
            <div>
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-gray-50 border-gray-300'
                } border h-10`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-2 text-sm text-red-400">{formik.errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-50 border-gray-300'
              } border h-10`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-2 text-sm text-red-400">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className={`mt-1 p-2 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500 text-white'
                    : 'bg-gray-50 border-gray-300'
                } border h-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="mt-2 text-sm text-red-400">{formik.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting || isLoginLoading || isSignupLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLogin ? 'Sign in' : 'Sign up'}
            {(formik.isSubmitting || isLoginLoading || isSignupLoading) && '...'}
          </button>
        </form>

        <button
          className={`text-md font-medium ${
            isDarkMode
              ? 'text-indigo-400 hover:text-indigo-300'
              : 'text-indigo-600 hover:text-indigo-500'
          }`}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
