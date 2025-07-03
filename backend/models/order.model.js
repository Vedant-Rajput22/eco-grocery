import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId:  { type: String, required: true, ref: "User" },
    items: [
      {
        product:  { type: String, required: true, ref: "Product" },
        quantity: { type: Number, required: true },
        price:    { type: Number, required: true }
      }
    ],
    amount:   { type: Number, required: true },
    address:  { type: String, required: true, ref: "Address" },
    status:   { type: String, default: "Order Placed" },

    /* Stripe-related fields */
    paymentType:     { type: String, required: true },  // "COD" | "Card"
    isPaid:          { type: Boolean, default: false },
    paymentIntentId: { type: String },                  // pi_...
    paidAt:          { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
