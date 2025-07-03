import express from 'express';
import Stripe  from 'stripe';
import authUser from '../middlewares/authUser.js';
import Order    from '../models/order.model.js';

const router  = express.Router();
const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-intent', authUser, async (req, res) => {
  const { items } = req.body;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const amount   = Math.round(subtotal * 1.08 * 100);   // 8 % GST, in paise

  const order = await Order.create({
    userId: req.user.id,
    items,
    amount: subtotal,          // keep ₹ value in DB
    paymentType: 'Card',
    isPaid: false
  });

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'inr',
    metadata: { orderId: order._id.toString() }
  });

  order.paymentIntentId = intent.id;
  await order.save();

  res.json({ clientSecret: intent.client_secret });
});

export default router;
