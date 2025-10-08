import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    dealType: {
      type: String,
      required: true,
      enum: ["buy", "sell", "swap"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    primaryCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    secondaryCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerNote: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    adminNote: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    customerContact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      preferredContactMethod: {
        type: String,
        enum: ["phone", "email", "both"],
        default: "both",
      },
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    dealHistory: [{
      action: {
        type: String,
        required: true,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      performedAt: {
        type: Date,
        default: Date.now,
      },
      note: {
        type: String,
        maxlength: 500,
      },
    }],
    expiresAt: {
      type: Date,
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

// Indexes
dealSchema.index({ dealType: 1, status: 1 });
dealSchema.index({ customer: 1 });
dealSchema.index({ primaryCar: 1 });
dealSchema.index({ secondaryCar: 1 });
dealSchema.index({ status: 1, createdAt: -1 });
dealSchema.index({ isActive: 1 });
dealSchema.index({ expiresAt: 1 });

// Virtuals
dealSchema.virtual('dealRef').get(function() {
  const typePrefix = this.dealType.toUpperCase().substring(0, 3);
  const idSuffix = this._id.toString().slice(-6).toUpperCase();
  return `${typePrefix}-${idSuffix}`;
});

dealSchema.virtual('dealAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

dealSchema.virtual('formattedOfferPrice').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.offerPrice);
});

// Middleware
dealSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.dealHistory.push({
      action: `Status changed to ${this.status}`,
      performedBy: this.processedBy,
      performedAt: new Date(),
      note: this.adminNote || this.rejectionReason
    });
  }
  next();
});

// Statics
dealSchema.statics.getDealStats = async function() {
  return await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: { dealType: "$dealType", status: "$status" },
        count: { $sum: 1 },
        totalValue: { $sum: "$offerPrice" }
      }
    },
    {
      $group: {
        _id: "$_id.dealType",
        statuses: {
          $push: {
            status: "$_id.status",
            count: "$count",
            totalValue: "$totalValue"
          }
        },
        totalDeals: { $sum: "$count" },
        totalValue: { $sum: "$totalValue" }
      }
    }
  ]);
};

dealSchema.methods.updateStatus = function(newStatus, adminId, note) {
  this.status = newStatus;
  this.processedBy = adminId;
  this.processedAt = new Date();
  
  if (note) {
    if (newStatus === 'rejected') {
      this.rejectionReason = note;
    } else {
      this.adminNote = note;
    }
  }
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  return this.save();
};

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;