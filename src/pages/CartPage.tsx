import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { removeFromCart, CartItem } from '../store/slices/cartSlice';

const CartPage: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map((item: CartItem) => (
              <li key={item.id} className="mb-4 p-4 border rounded">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p>Price: ${item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Subtotal: ${item.price * item.quantity}</p>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded mt-2 hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
            <Link
              to="/checkout"
              className="bg-green-500 text-white px-4 py-2 rounded mt-2 inline-block hover:bg-green-600"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
