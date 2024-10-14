import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from '../../types/Product';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await fetch('http://localhost:5000/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [] as Product[],
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export default productSlice.reducer;