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

// Update single user (admin only)
export const updateUser = async (req, res) => {
  try {
    console.log(`[UPDATE-USER] Request to update user: ${req.params.id}`);

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, email, role, phoneNumber, address, isVerified, isSuspended } = req.body;

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      user.email = email;
    }
    if (role !== undefined && role !== user.role) {
      // Only admin can change roles
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Only admins can change roles" });
      }
      user.role = role;
    }
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isSuspended !== undefined) user.isSuspended = isSuspended;

    await user.save();

    console.log(`[UPDATE-USER] Success - User updated: ${user._id}`);
    res.status(200).json({ 
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log(`[UPDATE-USER] Error:`, error.message);
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

