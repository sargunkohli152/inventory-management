import { RootState } from '@/app/redux';
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setAuthError } from './index';

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummaryId: string;
  totalExpenses: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface Users {
  userId: string;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  adminUserId: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface CurrentUser {
  adminUserId: string;
  name: string;
  email: string;
  hasAccess: boolean;
  priceId: string | null;
}

export interface UpdateUserRequest {
  name: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://inventory-management-backend-coh7.onrender.com',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).global.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const error = result.error as FetchBaseQueryError;
    if (error.status === 403 || error.status === 401) {
      // Dispatch auth error to global state
      const errorMessage =
        typeof error.data === 'object' && error.data !== null && 'message' in error.data
          ? (error.data as { message: string }).message
          : 'Authentication failed. Please login again.';
      api.dispatch(setAuthError(errorMessage));
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithErrorHandling,
  reducerPath: 'api',
  tagTypes: ['DashboardMetrics', 'Products', 'Users', 'Expenses', 'Auth'],

  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    signup: build.mutation<AuthResponse, SignupCredentials>({
      query: (credentials) => ({
        url: '/admin/signup',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: build.mutation<{ message: string }, void>({
      query: () => ({
        url: '/admin/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    getCurrentUser: build.query<CurrentUser, void>({
      query: () => '/admin/me',
      providesTags: ['Auth'],
    }),
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => '/dashboard',
      providesTags: ['DashboardMetrics'],
    }),
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: '/products',
        params: search ? { search } : {},
      }),
      providesTags: ['Products'],
    }),
    createProduct: build.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: build.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: `/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    getUsers: build.query<Users[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => '/expenses',
      providesTags: ['Expenses'],
    }),
    updateUser: build.mutation<CurrentUser, UpdateUserRequest>({
      query: (updateData) => ({
        url: '/admin/update',
        method: 'PATCH',
        body: updateData,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
  useUpdateUserMutation,
} = api;
