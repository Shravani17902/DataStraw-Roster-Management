
const Brand = require("../models/Brand");

// GET all brands
const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: brands.length,
            brands
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE brand
const createBrand = async (req, res) => {
    try {
        const { brandId, name, description, industry } = req.body;

        const brand = await Brand.create({
            brandId,
            name,
            description,
            industry
        });

        res.status(201).json({
            success: true,
            message: "Brand created successfully",
            brand
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE brand
const updateBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            brand
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE brand
const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Brand deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand
};

