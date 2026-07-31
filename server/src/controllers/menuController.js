import Category from "../models/categoryModel.js";
import MenuItem from "../models/menuItemModel.js";
import Restaurant from "../models/restaurantModel.js";

// Helper to resolve valid restaurantId from query, user session, or database fallback
const resolveRestaurantId = async (queryId, userId) => {
    let targetId = queryId || userId;
    if (!targetId || targetId === 'undefined' || targetId === 'null') {
        const firstRest = await Restaurant.findOne();
        if (firstRest) targetId = firstRest._id;
    }
    return targetId;
};

// --- Category Controllers ---

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const restaurantId = req.user.restaurantId;

        if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

        const category = await Category.create({ name, restaurantId });
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const restaurantId = await resolveRestaurantId(req.query.restaurantId, req.user?.restaurantId);

        if (!restaurantId) {
            return res.status(200).json({ success: true, categories: [] });
        }

        const categories = await Category.find({ restaurantId });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findOneAndDelete({ _id: id, restaurantId: req.user.restaurantId });
        
        if (!category) return res.status(404).json({ success: false, message: "Category not found or unauthorized" });
        
        // Also delete menu items associated with it
        await MenuItem.deleteMany({ categoryId: id });
        
        res.status(200).json({ success: true, message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- MenuItem Controllers ---

export const createMenuItem = async (req, res) => {
    try {
        const { name, price, description, image, categoryId, isVeg, isAvailable } = req.body;
        const restaurantId = req.user.restaurantId;

        if (!name || !price || !categoryId) {
            return res.status(400).json({ success: false, message: "Name, price and category are required" });
        }

        const menuItem = await MenuItem.create({
            name,
            price: Number(price),
            description,
            image,
            categoryId,
            restaurantId,
            isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
        });

        res.status(201).json({ success: true, menuItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMenuItems = async (req, res) => {
    try {
        const restaurantId = await resolveRestaurantId(req.query.restaurantId, req.user?.restaurantId);

        if (!restaurantId) {
            return res.status(200).json({ success: true, menuItems: [] });
        }

        const menuItems = await MenuItem.find({ restaurantId }).populate("categoryId", "name");
        res.status(200).json({ success: true, menuItems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, image, categoryId, isVeg, isAvailable } = req.body;

        const menuItem = await MenuItem.findOneAndUpdate(
            { _id: id, restaurantId: req.user.restaurantId },
            { name, price: Number(price), description, image, categoryId, isVeg, isAvailable },
            { new: true, runValidators: true }
        );

        if (!menuItem) return res.status(404).json({ success: false, message: "Menu item not found or unauthorized" });

        res.status(200).json({ success: true, menuItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findOneAndDelete({ _id: id, restaurantId: req.user.restaurantId });

        if (!menuItem) return res.status(404).json({ success: false, message: "Menu item not found or unauthorized" });

        res.status(200).json({ success: true, message: "Menu item deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
