const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.registerUser = async (req, res) => {
  try {

    const { name, password, role } = req.body;
    const email = req.body.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};


// LOGIN USER
exports.loginUser = async (req, res) => {
  try {

    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 🔐 Generate JWT Token HERE
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find().select("-password");

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



// DELETE USER
exports.deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Prevent deleting another admin
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted"
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: user._id
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};