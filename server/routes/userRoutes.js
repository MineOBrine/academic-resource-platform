const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  deleteUser
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// Test route
router.get("/test", (req, res) => {
  res.send("User route working");
});


// ADMIN ONLY → Get all users
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);


// ADMIN ONLY → Delete a user
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);


module.exports = router;