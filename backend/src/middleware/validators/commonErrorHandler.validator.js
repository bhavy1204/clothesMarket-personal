import { validationResult } from "express-validator"
import { APIError } from "../../utils/apiError.js"

export const handleValidationErrors = (req, res, next) => {
    console.log("THIS IS REQ BODY >>>> ",req.body)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log("VALIDATION ERRORS:", errors.array());

        return next(new APIError(400, "Validation failed", errors.array()));
    }

    

    console.log("AT end of validation")
    next()
}