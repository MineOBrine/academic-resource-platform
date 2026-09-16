const Resource = require("../models/Resource");


// Strip fileUrl from a resource doc when there's no authenticated user.
// This is what makes the "logged-in users only" rule actually hold —
// otherwise fileUrl would sit in the public /api/resources response
// and be visible to anyone in the network tab, regardless of the
// button-level auth check on the frontend.
const sanitizeForViewer = (resource, isAuthenticated) => {
    const obj = resource.toObject ? resource.toObject() : resource;
    if (!isAuthenticated) {
        const { fileUrl, ...rest } = obj;
        return rest;
    }
    return obj;
};


// CREATE RESOURCE
exports.createResource = async (req, res) => {
    try {
        console.log("req.file:", req.file);

        const { title, description, subject } = req.body;

        const fileUrl = req.file ? req.file.path : null;

        const resource = await Resource.create({
            title,
            description,
            subject,
            fileUrl,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            message: "Resource uploaded successfully",
            resource
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// GET ALL RESOURCES
// Public route, but fileUrl is only included when the requester is logged in.
exports.getResources = async (req, res) => {
    try {

        const resources = await Resource.find()
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        const isAuthenticated = !!req.user;
        const sanitized = resources.map(r => sanitizeForViewer(r, isAuthenticated));

        res.json({
            count: sanitized.length,
            resources: sanitized
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// GET RESOURCES UPLOADED BY CURRENT USER
// Already behind authMiddleware, and these are the user's own uploads — keep fileUrl.
exports.getMyResources = async (req, res) => {
    try {

        const resources = await Resource.find({
            uploadedBy: req.user.id
        }).populate("uploadedBy", "name email");

        res.json({
            count: resources.length,
            resources
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// SEARCH RESOURCES
// Same rule as getResources — fileUrl only for authenticated requests.
exports.searchResources = async (req, res) => {
    try {

        const keyword = req.query.keyword;

        const resources = await Resource.find({
            title: { $regex: keyword, $options: "i" }
        }).populate("uploadedBy", "name email");

        const isAuthenticated = !!req.user;
        const sanitized = resources.map(r => sanitizeForViewer(r, isAuthenticated));

        res.json({
            count: sanitized.length,
            resources: sanitized
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// VIEW RESOURCE (auth required) — used by the in-app document viewer AND
// the download button, so both actions only ever get fileUrl through a
// route that's actually gated by authMiddleware.
exports.viewResource = async (req, res) => {
    try {

        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        res.json({
            fileUrl: resource.fileUrl,
            title: resource.title
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// DELETE RESOURCE
exports.deleteResource = async (req, res) => {
  try {

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        message: "Resource not found"
      });
    }

    // Admin can delete anything
    if (req.user.role === "admin") {

      await resource.deleteOne();

      return res.json({
        message: "Resource deleted by admin"
      });
    }

    // User can delete their own resource
    if (resource.uploadedBy.toString() === req.user.id) {

      await resource.deleteOne();

      return res.json({
        message: "Resource deleted successfully"
      });
    }

    // Otherwise deny
    return res.status(403).json({
      message: "You are not authorized to delete this resource"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};