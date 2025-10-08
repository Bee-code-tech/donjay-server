import { Inspection, TimeSlot } from "../models/inspection.model.js";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
import { sendInspectionBookedEmail, sendInspectionConfirmedEmail, sendInspectionCompletedEmail, sendInspectionRescheduledEmail } from "../utils/emailNotifications.js";

// Book inspection
export const bookInspection = async (req, res) => {
  try {
    console.log(`[BOOK-INSPECTION] Request from user: ${req.user._id}`);

    const { carId, inspectionDate, timeSlot, customerNotes } = req.body;

    if (!carId || !inspectionDate || !timeSlot) {
      return res.status(400).json({
        error: "Missing required fields: carId, inspectionDate, timeSlot"
      });
    }

    const car = await Car.findOne({
      _id: carId,
      status: 'approved',
      isActive: true
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found or not approved" });
    }

    const requestedDate = new Date(inspectionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ error: "Cannot book inspection for past dates" });
    }

    // Check if time slot is available
    let availableSlots = await TimeSlot.findOne({
      date: requestedDate,
      period: timeSlot.period,
      isActive: true
    });

    if (!availableSlots) {
      const generatedSlots = TimeSlot.generateDailySlots(requestedDate);
      const periodSlots = generatedSlots.find(slot => slot.period === timeSlot.period);
      
      availableSlots = new TimeSlot(periodSlots);
      await availableSlots.save();
    }

    const targetSlot = availableSlots.slots.find(
      slot => slot.startTime === timeSlot.startTime && !slot.isBooked
    );

    if (!targetSlot) {
      return res.status(400).json({ error: "Selected time slot is not available" });
    }

    const newInspection = new Inspection({
      customer: req.user._id,
      car: carId,
      inspectionDate: requestedDate,
      timeSlot: {
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        period: timeSlot.period
      },
      customerNotes
    });

    await newInspection.save();

    // Mark slot as booked
    await TimeSlot.updateOne(
      {
        _id: availableSlots._id,
        'slots.startTime': timeSlot.startTime
      },
      {
        $set: {
          'slots.$.isBooked': true,
          'slots.$.bookedBy': newInspection._id
        }
      }
    );

    await newInspection.populate([
      { path: 'customer', select: 'name email phoneNumber' },
      { path: 'car', select: 'carName year price images owner' }
    ]);

    // Send email notifications
    await sendInspectionBookedEmail(newInspection, req.user, car).catch(console.error);

    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    admins.forEach(admin => {
      const adminSocketId = getReceiverSocketId(admin._id);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newInspectionBooked", {
          inspection: newInspection,
          message: `New inspection booked by ${req.user.name}`
        });
      }
    });

    console.log(`[BOOK-INSPECTION] Success - Inspection booked: ${newInspection._id}`);
    res.status(201).json({
      message: "Inspection booked successfully",
      inspection: newInspection
    });
  } catch (error) {
    console.log(`[BOOK-INSPECTION] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get available time slots
export const getAvailableSlots = async (req, res) => {
  try {
    console.log(`[GET-AVAILABLE-SLOTS] Request for date: ${req.query.date}`);

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ error: "Cannot get slots for past dates" });
    }

    let availableSlots = await TimeSlot.find({
      date: requestedDate,
      isActive: true
    }).sort({ period: 1 });

    if (availableSlots.length === 0) {
      const generatedSlots = TimeSlot.generateDailySlots(requestedDate);
      availableSlots = await TimeSlot.insertMany(generatedSlots);
    }

    const formattedSlots = availableSlots.map(periodSlot => ({
      period: periodSlot.period,
      availableSlots: periodSlot.slots.filter(slot => !slot.isBooked),
      totalSlots: periodSlot.slots.length,
      bookedSlots: periodSlot.slots.filter(slot => slot.isBooked).length
    }));

    console.log(`[GET-AVAILABLE-SLOTS] Success - Retrieved slots for ${date}`);
    res.status(200).json({ date, slots: formattedSlots });
  } catch (error) {
    console.log(`[GET-AVAILABLE-SLOTS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all inspections (admin)
export const getAllInspections = async (req, res) => {
  try {
    console.log(`[GET-ALL-INSPECTIONS] Request from admin: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = { isActive: true };
    if (req.query.status) filters.status = req.query.status;
    if (req.query.customer) filters.customer = req.query.customer;
    if (req.query.inspector) filters.inspector = req.query.inspector;

    if (req.query.startDate || req.query.endDate) {
      filters.inspectionDate = {};
      if (req.query.startDate) filters.inspectionDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.inspectionDate.$lte = new Date(req.query.endDate);
    }

    const inspections = await Inspection.find(filters)
      .populate('customer', 'name email phoneNumber')
      .populate('car', 'carName year price images owner condition')
      .populate('inspector', 'name email')
      .sort({ inspectionDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inspection.countDocuments(filters);

    console.log(`[GET-ALL-INSPECTIONS] Success - Retrieved ${inspections.length} inspections`);
    res.status(200).json({
      inspections,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInspections: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-ALL-INSPECTIONS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get my inspections
export const getMyInspections = async (req, res) => {
  try {
    console.log(`[GET-MY-INSPECTIONS] Request from user: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = { customer: req.user._id, isActive: true };
    if (req.query.status) filters.status = req.query.status;

    const inspections = await Inspection.find(filters)
      .populate('car', 'carName year price images owner condition')
      .populate('inspector', 'name email')
      .sort({ inspectionDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inspection.countDocuments(filters);

    console.log(`[GET-MY-INSPECTIONS] Success - Retrieved ${inspections.length} inspections`);
    res.status(200).json({
      inspections,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInspections: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-MY-INSPECTIONS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get inspection by ID
export const getInspectionById = async (req, res) => {
  try {
    console.log(`[GET-INSPECTION] Request for inspection: ${req.params.id}`);

    const inspection = await Inspection.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('customer', 'name email phoneNumber')
    .populate('car')
    .populate('inspector', 'name email');

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    // Check permissions
    if (req.user.role !== 'admin' && inspection.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    console.log(`[GET-INSPECTION] Success - Inspection retrieved: ${inspection._id}`);
    res.status(200).json({ inspection });
  } catch (error) {
    console.log(`[GET-INSPECTION] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reschedule inspection
export const rescheduleInspection = async (req, res) => {
  try {
    console.log(`[RESCHEDULE-INSPECTION] Request for inspection: ${req.params.id}`);

    const { newDate, newTimeSlot, reason } = req.body;

    if (!newDate || !newTimeSlot || !reason) {
      return res.status(400).json({
        error: "Missing required fields: newDate, newTimeSlot, reason"
      });
    }

    const inspection = await Inspection.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    // Check permissions
    if (req.user.role !== 'admin' && inspection.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (inspection.status === 'completed') {
      return res.status(400).json({ error: "Cannot reschedule completed inspection" });
    }

    const requestedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedDate < today) {
      return res.status(400).json({ error: "Cannot reschedule to past dates" });
    }

    // Release current time slot
    await inspection.releaseTimeSlot();

    // Check new time slot availability
    let availableSlots = await TimeSlot.findOne({
      date: requestedDate,
      period: newTimeSlot.period,
      isActive: true
    });

    if (!availableSlots) {
      const generatedSlots = TimeSlot.generateDailySlots(requestedDate);
      const periodSlots = generatedSlots.find(slot => slot.period === newTimeSlot.period);
      
      availableSlots = new TimeSlot(periodSlots);
      await availableSlots.save();
    }

    const targetSlot = availableSlots.slots.find(
      slot => slot.startTime === newTimeSlot.startTime && !slot.isBooked
    );

    if (!targetSlot) {
      return res.status(400).json({ error: "Selected time slot is not available" });
    }

    // Update inspection
    inspection.rescheduledFrom = {
      originalDate: inspection.inspectionDate,
      originalTimeSlot: inspection.timeSlot,
      reason
    };
    inspection.inspectionDate = requestedDate;
    inspection.timeSlot = newTimeSlot;
    inspection.status = 'rescheduled';

    await inspection.save();

    // Book new time slot
    await TimeSlot.updateOne(
      {
        _id: availableSlots._id,
        'slots.startTime': newTimeSlot.startTime
      },
      {
        $set: {
          'slots.$.isBooked': true,
          'slots.$.bookedBy': inspection._id
        }
      }
    );

    await inspection.populate([
      { path: 'customer', select: 'name email phoneNumber' },
      { path: 'car', select: 'carName year price images' }
    ]);

    // Send rescheduled email
    await sendInspectionRescheduledEmail(inspection, inspection.customer, inspection.car).catch(console.error);

    // Notify relevant parties
    const customerSocketId = getReceiverSocketId(inspection.customer._id);
    if (customerSocketId) {
      io.to(customerSocketId).emit("inspectionRescheduled", {
        inspection,
        message: "Your inspection has been rescheduled"
      });
    }

    console.log(`[RESCHEDULE-INSPECTION] Success - Inspection rescheduled: ${inspection._id}`);
    res.status(200).json({
      message: "Inspection rescheduled successfully",
      inspection
    });
  } catch (error) {
    console.log(`[RESCHEDULE-INSPECTION] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Confirm inspection (admin)
export const confirmInspection = async (req, res) => {
  try {
    console.log(`[CONFIRM-INSPECTION] Request for inspection: ${req.params.id}`);

    const { inspectorId } = req.body;

    const inspection = await Inspection.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    if (inspection.status !== 'pending' && inspection.status !== 'rescheduled') {
      return res.status(400).json({ error: "Only pending or rescheduled inspections can be confirmed" });
    }

    if (inspectorId) {
      const inspector = await User.findById(inspectorId);
      if (!inspector || inspector.role !== 'admin') {
        return res.status(400).json({ error: "Invalid inspector" });
      }
      inspection.inspector = inspectorId;
    }

    inspection.status = 'confirmed';
    inspection.confirmedAt = new Date();
    await inspection.save();

    await inspection.populate([
      { path: 'customer', select: 'name email phoneNumber' },
      { path: 'car', select: 'carName year price images' },
      { path: 'inspector', select: 'name email' }
    ]);

    // Send confirmation email
    await sendInspectionConfirmedEmail(inspection, inspection.customer, inspection.car).catch(console.error);

    // Notify customer
    const customerSocketId = getReceiverSocketId(inspection.customer._id);
    if (customerSocketId) {
      io.to(customerSocketId).emit("inspectionConfirmed", {
        inspection,
        message: "Your inspection has been confirmed"
      });
    }

    console.log(`[CONFIRM-INSPECTION] Success - Inspection confirmed: ${inspection._id}`);
    res.status(200).json({
      message: "Inspection confirmed successfully",
      inspection
    });
  } catch (error) {
    console.log(`[CONFIRM-INSPECTION] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Complete inspection (admin)
export const completeInspection = async (req, res) => {
  try {
    console.log(`[COMPLETE-INSPECTION] Request for inspection: ${req.params.id}`);

    const { inspectionReport, inspectorNotes } = req.body;

    const inspection = await Inspection.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    if (inspection.status !== 'confirmed' && inspection.status !== 'in-progress') {
      return res.status(400).json({ error: "Only confirmed or in-progress inspections can be completed" });
    }

    inspection.status = 'completed';
    inspection.completedAt = new Date();
    inspection.inspectorNotes = inspectorNotes;
    inspection.inspectionReport = inspectionReport;

    await inspection.save();

    // Release time slot for future bookings
    await inspection.releaseTimeSlot();

    await inspection.populate([
      { path: 'customer', select: 'name email phoneNumber' },
      { path: 'car', select: 'carName year price images' },
      { path: 'inspector', select: 'name email' }
    ]);

    // Send completion email
    await sendInspectionCompletedEmail(inspection, inspection.customer, inspection.car).catch(console.error);

    // Notify customer
    const customerSocketId = getReceiverSocketId(inspection.customer._id);
    if (customerSocketId) {
      io.to(customerSocketId).emit("inspectionCompleted", {
        inspection,
        message: "Your inspection has been completed"
      });
    }

    console.log(`[COMPLETE-INSPECTION] Success - Inspection completed: ${inspection._id}`);
    res.status(200).json({
      message: "Inspection completed successfully",
      inspection
    });
  } catch (error) {
    console.log(`[COMPLETE-INSPECTION] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Cancel inspection
export const cancelInspection = async (req, res) => {
  try {
    console.log(`[CANCEL-INSPECTION] Request for inspection: ${req.params.id}`);

    const { reason } = req.body;

    const inspection = await Inspection.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    // Check permissions
    if (req.user.role !== 'admin' && inspection.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (inspection.status === 'completed') {
      return res.status(400).json({ error: "Cannot cancel completed inspection" });
    }

    // Release time slot
    await inspection.releaseTimeSlot();

    inspection.status = 'cancelled';
    inspection.inspectorNotes = reason;
    await inspection.save();

    console.log(`[CANCEL-INSPECTION] Success - Inspection cancelled: ${inspection._id}`);
    res.status(200).json({ message: "Inspection cancelled successfully" });
  } catch (error) {
    console.log(`[CANCEL-INSPECTION] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};