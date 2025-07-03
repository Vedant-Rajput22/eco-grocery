import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Order from "./models/order.model.js";
dotenv.config();

import Stripe from "stripe";
import { connectDB } from "./config/connectDB.js";
import { connectCloudinary } from "./config/cloudinary.js";

/* Routes */
import userRoutes    from "./routes/user.routes.js";
import sellerRoutes  from "./routes/seller.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes    from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes   from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app    = express();

/* ---------- CLOUDINARY & DB ------------ */
await connectCloudinary();
await connectDB();                      // fail-fast if Mongo down

/* ---------- CORS & COOKIES ------------ */
const allowedOrigins = ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

/* ---------- STRIPE WEBHOOK ------------ */
/* MUST COME BEFORE express.json() */
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const pi     = event.data.object;
      const order  = await Order.findOne({ paymentIntentId: pi.id });
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();
        console.log(`✅ Order ${order._id} marked paid`);
      }
    }
    res.json({ received: true });
  }
);

/* ---------- JSON PARSER (for normal routes) -------- */
app.use(express.json());

/* ---------- STATIC & ROUTES ------------------------ */
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/order", orderRoutes);

/* ---------- START SERVER --------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
