import { validationResult } from "express-validator"
import { APIError } from "../../utils/apiError.js"

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    console.log("common errror handler 400 >> ", errors.array());
    if (!errors.isEmpty()) {

        return next(new APIError(400, "Validation failed", errors.array()));
    }

    next()
}