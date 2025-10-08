import Deal from "../models/deal.model.js";
import Car from "../models/car.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// Create a new deal
export const createDeal = async (req, res) => {
  try {
    console.log(`[CREATE-DEAL] Request from user: ${req.user._id}`);

    const {
      dealType,
      primaryCarId,
      secondaryCarId,
      offerPrice,
      additionalAmount = 0,
      customerNote,
      customerContact,
      priority = "medium",
      tags = [],
      expiresAt
    } = req.body;

    // Validation
    if (!dealType || !primaryCarId || !offerPrice || !customerContact) {
      return res.status(400).json({
        error: "Missing required fields: dealType, primaryCarId, offerPrice, customerContact"
      });
    }

    // Verify primary car exists and is approved
    const primaryCar = await Car.findOne({
      _id: primaryCarId,
      status: 'approved',
      isActive: true
    });

    if (!primaryCar) {
      return res.status(404).json({ error: "Primary car not found or not approved" });
    }

    // For swap deals, verify secondary car exists
    let secondaryCar = null;
    if (dealType === 'swap') {
      if (!secondaryCarId) {
        return res.status(400).json({ error: "Secondary car ID required for swap deals" });
      }
      
      secondaryCar = await Car.findOne({
        _id: secondaryCarId,
        status: 'approved',
        isActive: true
      });

      if (!secondaryCar) {
        return res.status(404).json({ error: "Secondary car not found or not approved" });
      }
    }

    // For sell deals, verify user owns the car
    if (dealType === 'sell' && primaryCar.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only create sell deals for cars you own" });
    }

    // For buy deals, user cannot buy their own car
    if (dealType === 'buy' && primaryCar.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot create a buy deal for your own car" });
    }

    const newDeal = new Deal({
      dealType,
      customer: req.user._id,
      primaryCar: primaryCarId,
      secondaryCar: dealType === 'swap' ? secondaryCarId : undefined,
      offerPrice,
      additionalAmount,
      customerNote,
      customerContact,
      priority,
      tags,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      dealHistory: [{
        action: `Deal created - ${dealType}`,
        performedBy: req.user._id,
        performedAt: new Date(),
        note: customerNote
      }]
    });

    await newDeal.save();
    await newDeal.populate([
      { path: 'customer', select: 'name email role profilePic phoneNumber' },
      { path: 'primaryCar', select: 'carName year price images owner' },
      { path: 'secondaryCar', select: 'carName year price images owner' }
    ]);

    // Notify admins about new deal
    const admins = await User.find({ role: 'admin' }).select('_id');
    admins.forEach(admin => {
      const adminSocketId = getReceiverSocketId(admin._id);
      if (adminSocketId) {
        io.to(adminSocketId).emit("newDeal", {
          deal: newDeal,
          message: `New ${dealType} deal created by ${req.user.name}`
        });
      }
    });

    console.log(`[CREATE-DEAL] Success - Deal created: ${newDeal._id}`);
    res.status(201).json({
      message: "Deal created successfully",
      deal: newDeal
    });
  } catch (error) {
    console.log(`[CREATE-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all deals (admin only)
export const getAllDeals = async (req, res) => {
  try {
    console.log(`[GET-ALL-DEALS] Request from admin: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { isActive: true };
    if (req.query.dealType) filters.dealType = req.query.dealType;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.customer) filters.customer = req.query.customer;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) filters.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.createdAt.$lte = new Date(req.query.endDate);
    }

    const deals = await Deal.find(filters)
      .populate('customer', 'name email role profilePic phoneNumber')
      .populate('primaryCar', 'carName year price images owner condition mileage')
      .populate('secondaryCar', 'carName year price images owner condition mileage')
      .populate('processedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Deal.countDocuments(filters);

    console.log(`[GET-ALL-DEALS] Success - Retrieved ${deals.length} deals`);
    res.status(200).json({
      deals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDeals: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-ALL-DEALS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get single deal by ID
export const getDealById = async (req, res) => {
  try {
    console.log(`[GET-DEAL] Request for deal: ${req.params.id}`);

    const deal = await Deal.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('customer', 'name email role profilePic phoneNumber')
    .populate('primaryCar')
    .populate('secondaryCar')
    .populate('processedBy', 'name email role')
    .populate('dealHistory.performedBy', 'name role');

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    // Check permissions
    if (req.user.role !== 'admin' && deal.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    console.log(`[GET-DEAL] Success - Deal retrieved: ${deal._id}`);
    res.status(200).json({ deal });
  } catch (error) {
    console.log(`[GET-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user's own deals
export const getMyDeals = async (req, res) => {
  try {
    console.log(`[GET-MY-DEALS] Request from user: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = { customer: req.user._id, isActive: true };
    if (req.query.dealType) filters.dealType = req.query.dealType;
    if (req.query.status) filters.status = req.query.status;

    const deals = await Deal.find(filters)
      .populate('primaryCar', 'carName year price images owner condition mileage')
      .populate('secondaryCar', 'carName year price images owner condition mileage')
      .populate('processedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Deal.countDocuments(filters);

    console.log(`[GET-MY-DEALS] Success - Retrieved ${deals.length} deals for user`);
    res.status(200).json({
      deals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDeals: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-MY-DEALS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update deal (customer can update pending deals, admin can update any)
export const updateDeal = async (req, res) => {
  try {
    console.log(`[UPDATE-DEAL] Request for deal: ${req.params.id} from user: ${req.user._id}`);

    const deal = await Deal.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    // Permission check
    const isOwner = deal.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Customers can only update pending deals
    if (isOwner && !isAdmin && deal.status !== 'pending') {
      return res.status(403).json({ error: "You can only update pending deals" });
    }

    const updates = { ...req.body };
    
    // Remove fields that shouldn't be directly updated
    delete updates.customer;
    delete updates.dealHistory;
    delete updates.processedBy;
    delete updates.processedAt;

    // Add history entry for significant changes
    if (updates.status && updates.status !== deal.status) {
      updates.processedBy = req.user._id;
      updates.processedAt = new Date();
      
      if (updates.status === 'completed') {
        updates.completedAt = new Date();
      }
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('customer', 'name email role profilePic phoneNumber')
    .populate('primaryCar', 'carName year price images')
    .populate('secondaryCar', 'carName year price images')
    .populate('processedBy', 'name email role');

    // Notify relevant parties
    if (updates.status) {
      const customerSocketId = getReceiverSocketId(deal.customer);
      if (customerSocketId) {
        io.to(customerSocketId).emit("dealStatusUpdate", {
          dealId: deal._id,
          newStatus: updates.status,
          message: `Your ${deal.dealType} deal status changed to ${updates.status}`
        });
      }
    }

    console.log(`[UPDATE-DEAL] Success - Deal updated: ${updatedDeal._id}`);
    res.status(200).json({
      message: "Deal updated successfully",
      deal: updatedDeal
    });
  } catch (error) {
    console.log(`[UPDATE-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Approve deal (admin only)
export const approveDeal = async (req, res) => {
  try {
    console.log(`[APPROVE-DEAL] Request for deal: ${req.params.id} from admin: ${req.user._id}`);

    const { adminNote } = req.body;

    const deal = await Deal.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    if (deal.status !== 'pending') {
      return res.status(400).json({ error: "Only pending deals can be approved" });
    }

    await deal.updateStatus('approved', req.user._id, adminNote);
    await deal.populate([
      { path: 'customer', select: 'name email role profilePic phoneNumber' },
      { path: 'primaryCar', select: 'carName year price images' },
      { path: 'secondaryCar', select: 'carName year price images' },
      { path: 'processedBy', select: 'name email role' }
    ]);

    // Notify customer
    const customerSocketId = getReceiverSocketId(deal.customer._id);
    if (customerSocketId) {
      io.to(customerSocketId).emit("dealApproved", {
        deal,
        message: `Your ${deal.dealType} deal has been approved!`
      });
    }

    console.log(`[APPROVE-DEAL] Success - Deal approved: ${deal._id}`);
    res.status(200).json({
      message: "Deal approved successfully",
      deal
    });
  } catch (error) {
    console.log(`[APPROVE-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Reject deal (admin only)
export const rejectDeal = async (req, res) => {
  try {
    console.log(`[REJECT-DEAL] Request for deal: ${req.params.id} from admin: ${req.user._id}`);

    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const deal = await Deal.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    await deal.updateStatus('rejected', req.user._id, rejectionReason);
    await deal.populate([
      { path: 'customer', select: 'name email role profilePic phoneNumber' },
      { path: 'primaryCar', select: 'carName year price images' },
      { path: 'secondaryCar', select: 'carName year price images' },
      { path: 'processedBy', select: 'name email role' }
    ]);

    // Notify customer
    const customerSocketId = getReceiverSocketId(deal.customer._id);
    if (customerSocketId) {
      io.to(customerSocketId).emit("dealRejected", {
        deal,
        message: `Your ${deal.dealType} deal has been rejected.`,
        reason: rejectionReason
      });
    }

    console.log(`[REJECT-DEAL] Success - Deal rejected: ${deal._id}`);
    res.status(200).json({
      message: "Deal rejected successfully",
      deal
    });
  } catch (error) {
    console.log(`[REJECT-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Complete deal (admin only)
export const completeDeal = async (req, res) => {
  try {
    console.log(`[COMPLETE-DEAL] Request for deal: ${req.params.id} from admin: ${req.user._id}`);

    const { adminNote } = req.body;

    const deal = await Deal.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    if (deal.status !== 'approved') {
      return res.status(400).json({ error: "Only approved deals can be completed" });
    }

    await deal.updateStatus('completed', req.user._id, adminNote);
    await deal.populate([
      { path: 'customer', select: 'name email role profilePic phoneNumber' },
      { path: 'primaryCar', select: 'carName year price images' },
      { path: 'secondaryCar', select: 'carName year price images' },
      { path: 'processedBy', select: 'name email role' }
    ]);

    // Notify customer
    const customerSocketId = getReceiverSocketId(deal.customer._id);
    if (customerSocketId) {
      io.to(customerSocketId).emit("dealCompleted", {
        deal,
        message: `Your ${deal.dealType} deal has been completed!`
      });
    }

    console.log(`[COMPLETE-DEAL] Success - Deal completed: ${deal._id}`);
    res.status(200).json({
      message: "Deal completed successfully",
      deal
    });
  } catch (error) {
    console.log(`[COMPLETE-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete deal (soft delete)
export const deleteDeal = async (req, res) => {
  try {
    console.log(`[DELETE-DEAL] Request for deal: ${req.params.id} from user: ${req.user._id}`);

    const deal = await Deal.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }

    // Permission check
    const isOwner = deal.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Customers can only delete pending deals
    if (isOwner && !isAdmin && deal.status !== 'pending') {
      return res.status(403).json({ error: "You can only delete pending deals" });
    }

    await Deal.findByIdAndUpdate(req.params.id, { 
      isActive: false,
      status: 'cancelled'
    });

    console.log(`[DELETE-DEAL] Success - Deal deleted: ${req.params.id}`);
    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (error) {
    console.log(`[DELETE-DEAL] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get deal statistics (admin only)
export const getDealStats = async (req, res) => {
  try {
    console.log(`[GET-DEAL-STATS] Request from admin: ${req.user._id}`);

    const stats = await Deal.getDealStats();
    
    // Additional aggregations
    const totalDeals = await Deal.countDocuments({ isActive: true });
    const pendingDeals = await Deal.countDocuments({ status: 'pending', isActive: true });
    const completedDeals = await Deal.countDocuments({ status: 'completed', isActive: true });
    
    const recentDeals = await Deal.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .populate('primaryCar', 'carName year price')
      .select('dealType status offerPrice createdAt');

    console.log(`[GET-DEAL-STATS] Success - Stats retrieved`);
    res.status(200).json({
      dealTypeStats: stats,
      summary: {
        totalDeals,
        pendingDeals,
        completedDeals,
        rejectedDeals: await Deal.countDocuments({ status: 'rejected', isActive: true }),
        approvedDeals: await Deal.countDocuments({ status: 'approved', isActive: true })
      },
      recentDeals
    });
  } catch (error) {
    console.log(`[GET-DEAL-STATS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};