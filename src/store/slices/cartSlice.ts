import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types/Product';

export interface CartItem extends Product {
  quantity: number;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: [] as CartItem[],
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      return state.filter(item => item.id !== action.payload);
    },
    clearCart: () => {
      return []; // This will correctly clear the cart
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
