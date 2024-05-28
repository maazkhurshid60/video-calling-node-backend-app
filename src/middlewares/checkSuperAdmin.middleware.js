import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkSuperAdminRole = asyncHandler(async(req, _, next) => {
    try {
       
        const userRole = req.user.userRole;
        
        if (userRole !== 'SUPER-ADMIN') {
            throw new ApiError(401, "Unauthorized request")
        }
    
        next()
    } catch (error) {
        throw new ApiError(400, "Unauthorized request");
    }
    
})