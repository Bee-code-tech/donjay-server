import User from "../models/user.model.js";

// Get all users (admin only)  
export const getAllUsers = async (req, res) => {
  try {
    console.log(`[GET-ALL-USERS] Request from admin: ${req.user._id}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filters)
      .select('-password -otp -otpExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filters);

    console.log(`[GET-ALL-USERS] Success - Retrieved ${users.length} users`);
    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.log(`[GET-ALL-USERS] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get single user (admin only)
export const getUserById = async (req, res) => {
  try {
    console.log(`[GET-USER] Request for user: ${req.params.id}`);

    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`[GET-USER] Success - User retrieved: ${user._id}`);
    res.status(200).json({ user });
  } catch (error) {
    console.log(`[GET-USER] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Suspend single user (admin only)
export const suspendUser = async (req, res) => {
  try {
    console.log(`[SUSPEND-USER] Request to suspend user: ${req.params.id}`);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent suspending oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot suspend yourself" });
    }

    // Toggle suspension status
    user.isSuspended = !user.isSuspended;
    await user.save();

    const action = user.isSuspended ? 'suspended' : 'unsuspended';
    console.log(`[SUSPEND-USER] Success - User ${action}: ${user._id}`);
    res.status(200).json({ 
      message: `User ${action} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended
      }
    });
  } catch (error) {
    console.log(`[SUSPEND-USER] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete single user (admin only)
export const deleteUser = async (req, res) => {
  try {
    console.log(`[DELETE-USER] Request to delete user: ${req.params.id}`);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`[DELETE-USER] Success - User deleted: ${req.params.id}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(`[DELETE-USER] Error:`, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};