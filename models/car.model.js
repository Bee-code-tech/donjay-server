import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    carName: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    condition: {
      type: String,
      required: true,
      enum: ["new", "used", "certified pre-owned"],
    },
    transmission: {
      type: String,
      required: true,
      enum: ["automatic", "manual", "cvt"],
    },
    fuelType: {
      type: String,
      required: true,
      enum: ["petrol", "diesel", "electric", "hybrid", "cng", "lpg"],
    },
    engine: {
      type: String,
      required: true,
      trim: true,
    },
    mileage: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    images: [{
      type: String,
      required: true,
    }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
carSchema.index({ status: 1, isActive: 1 });
carSchema.index({ owner: 1 });
carSchema.index({ year: 1, price: 1 });

// Virtual for formatted price
carSchema.virtual('formattedPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.price);
});

const Car = mongoose.model("Car", carSchema);

export default Car;