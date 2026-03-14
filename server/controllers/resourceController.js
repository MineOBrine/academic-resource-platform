const Resource = require("../models/Resource");


// CREATE RESOURCE
exports.createResource = async (req, res) => {
    try {

        const { title, description, subject } = req.body;

        const fileUrl = req.file ? req.file.filename : null;

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
exports.getResources = async (req, res) => {
    try {

        const resources = await Resource.find()
            .populate("uploadedBy", "name email")
            .sort({ createdAt: -1 });

        res.json({
            count: resources.length,
            resources
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// GET RESOURCES UPLOADED BY CURRENT USER
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
exports.searchResources = async (req, res) => {
    try {

        const keyword = req.query.keyword;

        const resources = await Resource.find({
            title: { $regex: keyword, $options: "i" }
        }).populate("uploadedBy", "name email");

        res.json({
            count: resources.length,
            resources
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