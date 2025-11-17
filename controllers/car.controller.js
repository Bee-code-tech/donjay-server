import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { sendCarApprovedEmail, sendCarRejectedEmail, sendNewCarSubmittedEmail } from "../utils/emailNotifications.js";

// Create a new car listing
export const createCar = async (req, res) => {
  try {
    console.log(`[CREATE-CAR] Request from user: ${req.user._id}`);

    const {
      carName,
      year,
      condition,
      transmission,
      fuelType,
      engine,
      mileage,
      price,
      note,
      images,
      isSwap
    } = req.body;

    // Validation
    if (!carName || !year || !condition || !transmission || !fuelType || !engine || mileage === undefined || !price || !images?.length) {
      return res.status(400).json({
        error: "Missing required fields: carName, year, condition, transmission, fuelType, engine, mileage, price, and at least one image"
      });
    }

    // Set status based on user role
    const status = req.user.role === 'admin' ? 'approved' : 'pending';
    const approvedBy = req.user.role === 'admin' ? req.user._id : undefined;
    const approvedAt = req.user.role === 'admin' ? new Date() : undefined;

    const newCar = new Car({
      carName,
      year,
      condition,
      transmission,
      fuelType,
      engine,
      mileage,
      price,
      note,
      images,
      isSwap: isSwap || false,
      status,
      owner: req.user._id,
      approvedBy,
      approvedAt
    });

    await newCar.save();
    await newCar.populate('owner', 'name email role');

    // Send email notifications
    if (status === 'approved') {
      await sendCarApprovedEmail(newCar, req.user).catch(console.error);
    } else {
      await sendNewCarSubmittedEmail(newCar, req.user).catch(console.error);
    }

    console.log(`[CREATE-CAR] Success - Car created: ${newCar._id} (Status: ${status})`);
    res.status(201).json({
      message: `Car listing ${status === 'approved' ? 'created and approved' : 'created successfully and pending approvals'}`,
      car: newCar
    });
  } catch (error) {
    console.log(`[CREATE-CAR] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all cars (admin only - includes pending and approved)
export const getAllCars = async (req, res) => {
  try {
    console.log(`[GET-ALL-CARS] Request from admin: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cars = await Car.find({ isActive: true })
      .populate('owner', 'name email role')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Car.countDocuments({ isActive: true });

    console.log(`[GET-ALL-CARS] Success - Retrieved ${cars.length} cars`);
    res.status(200).json({
      cars,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.log(`[GET-ALL-CARS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get approved cars only (public endpoint)
export const getApprovedCars = async (req, res) => {
  try {
    console.log(`[GET-APPROVED-CARS] Request received`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { status: 'approved', isActive: true };

    if (req.query.minPrice) filters.price = { ...filters.price, $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) filters.price = { ...filters.price, $lte: parseInt(req.query.maxPrice) };
    if (req.query.year) filters.year = parseInt(req.query.year);
    if (req.query.condition) filters.condition = req.query.condition;
    if (req.query.transmission) filters.transmission = req.query.transmission;
    if (req.query.fuelType) filters.fuelType = req.query.fuelType;

    const cars = await Car.find(filters)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Car.countDocuments(filters);

    console.log(`[GET-APPROVED-CARS] Success - Retrieved ${cars.length} approved cars`);
    res.status(200).json({
      cars,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-APPROVED-CARS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get single car by ID
export const getCarById = async (req, res) => {
  try {
    console.log(`[GET-CAR] Request for car: ${req.params.id}`);

    const car = await Car.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('owner', 'name email role phoneNumber')
    .populate('approvedBy', 'name email');

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // If car is pending, only owner and admin can view
    if (car.status === 'pending' && req.user) {
      if (req.user._id.toString() !== car.owner._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Car is pending approval." });
      }
    } else if (car.status === 'pending' && !req.user) {
      return res.status(403).json({ error: "Access denied. Car is pending approval." });
    }

    console.log(`[GET-CAR] Success - Car retrieved: ${car._id}`);
    res.status(200).json({ car });
  } catch (error) {
    console.log(`[GET-CAR] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user's own cars
export const getMyCars = async (req, res) => {
  try {
    console.log(`[GET-MY-CARS] Request from user: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cars = await Car.find({
      owner: req.user._id,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Car.countDocuments({ owner: req.user._id, isActive: true });

    console.log(`[GET-MY-CARS] Success - Retrieved ${cars.length} cars for user`);
    res.status(200).json({
      cars,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-MY-CARS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update car (owner only for their cars)
export const updateCar = async (req, res) => {
  try {
    console.log(`[UPDATE-CAR] Request for car: ${req.params.id} from user: ${req.user._id}`);

    const car = await Car.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Only owner can update their car
    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied. You can only update your own cars." });
    }

    // If car was approved, set it back to pending after update (unless user is admin)
    const updates = { ...req.body };
    if (car.status === 'approved' && req.user.role !== 'admin') {
      updates.status = 'pending';
      updates.approvedBy = undefined;
      updates.approvedAt = undefined;
    }

    // Handle isSwap field
    if (req.body.isSwap !== undefined) {
      updates.isSwap = req.body.isSwap;
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email role');

    console.log(`[UPDATE-CAR] Success - Car updated: ${updatedCar._id}`);
    res.status(200).json({
      message: "Car updated successfully",
      car: updatedCar
    });
  } catch (error) {
    console.log(`[UPDATE-CAR] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Approve car (admin only)
export const approveCar = async (req, res) => {
  try {
    console.log(`[APPROVE-CAR] Request for car: ${req.params.id} from admin: ${req.user._id}`);

    const car = await Car.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    if (car.status === 'approved') {
      return res.status(400).json({ error: "Car is already approved" });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('owner', 'name email')
     .populate('approvedBy', 'name email');

    // Send approval email
    await sendCarApprovedEmail(updatedCar, updatedCar.owner).catch(console.error);

    console.log(`[APPROVE-CAR] Success - Car approved: ${updatedCar._id}`);
    res.status(200).json({
      message: "Car approved successfully",
      car: updatedCar
    });
  } catch (error) {
    console.log(`[APPROVE-CAR] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reject car (admin only)
export const rejectCar = async (req, res) => {
  try {
    console.log(`[REJECT-CAR] Request for car: ${req.params.id} from admin: ${req.user._id}`);

    const { reason } = req.body;

    const car = await Car.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: req.user._id,
        rejectedAt: new Date()
      },
      { new: true }
    ).populate('owner', 'name email')
     .populate('rejectedBy', 'name email');

    // Send rejection email
    await sendCarRejectedEmail(updatedCar, updatedCar.owner, reason).catch(console.error);

    console.log(`[REJECT-CAR] Success - Car rejected: ${updatedCar._id}`);
    res.status(200).json({
      message: "Car rejected successfully",
      car: updatedCar
    });
  } catch (error) {
    console.log(`[REJECT-CAR] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete car (admin only or owner can soft delete)
export const deleteCar = async (req, res) => {
  try {
    console.log(`[DELETE-CAR] Request for car: ${req.params.id} from user: ${req.user._id}`);

    const car = await Car.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Admin can delete any car, owner can only delete their own
    if (req.user.role !== 'admin' && car.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Soft delete (set isActive to false)
    await Car.findByIdAndUpdate(req.params.id, { isActive: false });

    console.log(`[DELETE-CAR] Success - Car deleted: ${req.params.id}`);
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.log(`[DELETE-CAR] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};