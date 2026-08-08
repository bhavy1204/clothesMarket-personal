import slugify from "slugify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/apiResponse.js";
import { APIError } from "../utils/apiError.js";
import { City } from "../models/city.model.js";

const createCity = asyncHandler(async (req, res) => {
    const {
        name,
        state,
        country,
        settings
    } = req.body;

    if (
        !name ||
        !state ||
        settings?.deliveryCharge === undefined ||
        settings?.freeDeliveryAbove === undefined ||
        !settings?.supportEmail ||
        !settings?.supportPhone
    ) {
        throw new APIError(400, "All required fields are mandatory");
    }

    const slug = slugify(`${state}-${name}`, {
        lower: true,
        strict: true,
        trim: true,
    });

    const existingCity = await City.findOne({ slug });

    if (existingCity) {
        throw new APIError(409, "City already exists");
    }

    const city = await City.create({
        name,
        state,
        country: country || "india",
        slug,
        settings,
    });

    return res
        .status(201)
        .json(new APIResponse(201, city, "City created successfully"));
});


const getAllCities = asyncHandler(async (req, res) => {
    
    console.log("=== ALL CITIES REQUEST ===");
    console.log("User-Agent:", req.get("user-agent"));
    console.log("Origin:", req.get("origin"));
    console.log("Referer:", req.get("referer"));
    console.log("IP:", req.ip);
    console.log("Accept:", req.get("accept"));
    console.log("Accept-Language:", req.get("accept-language"));
    console.log("=============================");
    const cities = await City.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new APIResponse(200, cities, "Cities fetched successfully"));
});


const getAllActiveCities = asyncHandler(async (req, res) => {
    console.log("=== ACTIVE CITIES REQUEST ===");
    console.log("User-Agent:", req.get("user-agent"));
    console.log("Origin:", req.get("origin"));
    console.log("Referer:", req.get("referer"));
    console.log("IP:", req.ip);
    console.log("Accept:", req.get("accept"));
    console.log("Accept-Language:", req.get("accept-language"));
    console.log("=============================");
    const cities = await City.find({ isActive: true }).sort({ name: 1 });

    return res
        .status(200)
        .json(new APIResponse(200, cities, "Active cities fetched successfully"));
});


const getCityById = asyncHandler(async (req, res) => {
    const { cityId } = req.params;

    const city = await City.findById(cityId);

    if (!city) {
        throw new APIError(404, "City not found");
    }

    return res
        .status(200)
        .json(new APIResponse(200, city, "City fetched successfully"));
});


const toggleCityStatus = asyncHandler(async (req, res) => {
    const { cityId } = req.params;

    const city = await City.findById(cityId);

    if (!city) {
        throw new APIError(404, "City not found");
    }

    city.isActive = !city.isActive;

    await city.save();

    return res.status(200).json(
        new APIResponse(
            200,
            city,
            `City ${city.isActive ? "activated" : "deactivated"} successfully`
        )
    );
});


const deleteCity = asyncHandler(async (req, res) => {
    const { cityId } = req.params;

    const city = await City.findById(cityId);

    if (!city) {
        throw new APIError(404, "City not found");
    }

    await city.deleteOne();

    return res
        .status(200)
        .json(new APIResponse(200, {}, "City deleted successfully"));
});

export {
    createCity,
    getAllCities,
    getAllActiveCities,
    getCityById,
    toggleCityStatus,
    deleteCity,
};




