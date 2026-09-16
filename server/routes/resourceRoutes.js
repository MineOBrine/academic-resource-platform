const express = require("express");
const router = express.Router();

const {
  createResource,
  getResources,
  getMyResources,
  searchResources,
  deleteResource,
  viewResource
} = require("../controllers/resourceController");

const authMiddleware         = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const upload                 = require("../middleware/uploadMiddleware");


// GET all resources — public, but fileUrl only included for logged-in users
router.get("/", optionalAuthMiddleware, getResources);


// SEARCH resources — public, but fileUrl only included for logged-in users
router.get("/search", optionalAuthMiddleware, searchResources);


// GET resources uploaded by logged-in user
router.get("/my", authMiddleware, getMyResources);


// VIEW a resource's file (auth required) — used by the in-app document viewer
router.get("/:id/view", authMiddleware, viewResource);


// CREATE resource
router.post(
  "/",
  authMiddleware,
  upload.single("file"),
  createResource
);


// DELETE resource (owner OR admin)
router.delete(
  "/:id",
  authMiddleware,
  deleteResource
);

module.exports = router;