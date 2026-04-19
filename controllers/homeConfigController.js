import HomeConfig from "../models/HomeConfig.js";

// GET: Publicly accessible
export const getPublicHomeConfig = async (req, res) => {
  try {
    const config = await HomeConfig.findOne();
    // Return the config or a new instance (to ensure defaults like tagline exist)
    res.status(200).json(config || new HomeConfig()); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching manifest", error: error.message });
  }
};

// GET: For the Admin Editor
export const getAdminHomeConfig = async (req, res) => {
  try {
    const config = await HomeConfig.findOne();
    res.status(200).json(config || new HomeConfig());
  } catch (error) {
    res.status(500).json({ message: "FETCH_FAILURE", error: error.message });
  }
};

// PUT: For saving changes
export const updateHomeConfig = async (req, res) => {
  try {
    const config = await HomeConfig.findOneAndUpdate(
      {}, 
      { ...req.body, updatedBy: req.user.id },
      { 
        upsert: true, 
        returnDocument: 'after', // Fixed: Replaced 'new: true' to kill deprecation warning
        runValidators: true      // Ensures the update follows your Schema rules
      }
    );
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "COMMIT_FAILURE", error: error.message });
  }
};