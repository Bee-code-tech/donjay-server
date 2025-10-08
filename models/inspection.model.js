import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
      period: {
        type: String,
        enum: ["morning", "afternoon", "night"],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    customerNotes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    inspectorNotes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    inspectionReport: {
      overallCondition: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
      },
      exteriorCondition: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
      },
      interiorCondition: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
      },
      engineCondition: {
        type: String,
        enum: ["excellent", "good", "fair", "poor"],
      },
      issues: [{
        type: String,
        trim: true,
      }],
      recommendations: [{
        type: String,
        trim: true,
      }],
      images: [{
        type: String,
      }],
      estimatedValue: {
        type: Number,
        min: 0,
      },
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    confirmedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    rescheduledFrom: {
      originalDate: Date,
      originalTimeSlot: {
        startTime: String,
        endTime: String,
        period: String,
      },
      reason: {
        type: String,
        maxlength: 300,
      },
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

// Time slot schema for available slots
const timeSlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      enum: ["morning", "afternoon", "night"],
      required: true,
    },
    slots: [{
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
      bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inspection",
      },
    }],
    maxSlots: {
      type: Number,
      default: 16,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true
  }
);

// Indexes
inspectionSchema.index({ customer: 1 });
inspectionSchema.index({ car: 1 });
inspectionSchema.index({ inspectionDate: 1 });
inspectionSchema.index({ status: 1 });
inspectionSchema.index({ isActive: 1 });

timeSlotSchema.index({ date: 1, period: 1 });
timeSlotSchema.index({ isActive: 1 });

// Virtuals
inspectionSchema.virtual('inspectionRef').get(function() {
  const dateStr = this.inspectionDate.toISOString().slice(0, 10).replace(/-/g, '');
  const idSuffix = this._id.toString().slice(-4).toUpperCase();
  return `INS-${dateStr}-${idSuffix}`;
});

// Statics for time slot generation
timeSlotSchema.statics.generateDailySlots = function(date) {
  const morningSlots = [];
  const afternoonSlots = [];
  const nightSlots = [];
  
  // Morning: 9:00 AM - 12:00 PM (6 slots)
  for (let hour = 9; hour < 12; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      morningSlots.push({ startTime, endTime, isBooked: false });
    }
  }
  
  // Afternoon: 1:00 PM - 5:00 PM (8 slots)
  for (let hour = 13; hour < 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      afternoonSlots.push({ startTime, endTime, isBooked: false });
    }
  }
  
  // Night: 6:00 PM - 8:00 PM (4 slots)
  for (let hour = 18; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      nightSlots.push({ startTime, endTime, isBooked: false });
    }
  }
  
  return [
    { date, period: 'morning', slots: morningSlots },
    { date, period: 'afternoon', slots: afternoonSlots },
    { date, period: 'night', slots: nightSlots }
  ];
};

// Instance method to mark slot as available
inspectionSchema.methods.releaseTimeSlot = async function() {
  const TimeSlot = mongoose.model('TimeSlot');
  await TimeSlot.updateOne(
    {
      date: this.inspectionDate,
      period: this.timeSlot.period,
      'slots.startTime': this.timeSlot.startTime
    },
    {
      $set: {
        'slots.$.isBooked': false,
        'slots.$.bookedBy': null
      }
    }
  );
};

const Inspection = mongoose.model("Inspection", inspectionSchema);
const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);

export { Inspection, TimeSlot };
export default Inspection;