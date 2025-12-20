import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  {
    timestamps: true,
  }
);
cartSchema.index({ user: 1, product: 1, variant: 1 }, { unique: true });

cartSchema.index({ user: 1 });
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
