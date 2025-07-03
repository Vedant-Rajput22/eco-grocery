import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useContext } from "react";
import { AppContext } from '../context/AppContext';
// ─── Stripe init (publishable key from .env) ──────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ─── Inner form component (sees the Elements context) ─────────────────
function CheckoutForm() {
  const { items, clearCart } = useContext(AppContext);
  const [clientSecret, setClientSecret] = useState(null);
  const [processing, setProcessing]    = useState(false);
  const [msg, setMsg]                  = useState('');
  const stripe   = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // Hit backend to make PaymentIntent when component mounts
  useEffect(() => {
    if (!items.length) return;
    axios.post('/api/payment/create-intent', { items }, { withCredentials:true })
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(err => setMsg(err.response?.data?.message || 'Server error'));
  }, [items]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });

    if (error) {
      setMsg(error.message);
      setProcessing(false);
      return;
    }

    // success!
    clearCart();
    navigate('/success');
  };

  if (!items.length) return <p className="p-8 text-center">Cart is empty.</p>;

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handlePay} className="space-y-6 max-w-md">
        <CardElement className="p-4 border rounded bg-white dark:bg-neutral-800" />
        {msg && <p className="text-red-600">{msg}</p>}
        <button
          type="submit"
          disabled={processing}
          className="w-full bg-primary-600 text-white py-2 rounded disabled:opacity-50"
        >
          {processing ? 'Processing…' : `Pay ₹${total.toFixed(2)}`}
        </button>
      </form>
    </>
  );
}

// ─── Page wrapper with Elements provider ──────────────────────────────
export default function CheckoutPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
