import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { deletePreviousUserProfileImage } from "../utils/cloudinary.js"

const registerAdminUser = asyncHandler( async (req, res) => {

    const {userFullName, userEmail, userPhoneNumber, userPassword, userGender, userLanguage } = req.body;

    if (
        [userFullName, userEmail, userPhoneNumber, userPassword, userGender, userLanguage].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userEmail }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await User.create({
        userFullName,
        userEmail,
        userPhoneNumber,
        userPassword,
        userGender,
        userLanguage,
        userRole: "ADMIN",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

});

const registerNormalUser = asyncHandler( async (req, res) => {

    const {userFullName, userEmail, userPhoneNumber, userPassword, userGender, userLanguage } = req.body
    //console.log("email: ", email);

    if (
        [userFullName, userEmail, userPhoneNumber, userPassword, userGender, userLanguage].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userEmail }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await User.create({
        userFullName,
        userEmail,
        userPhoneNumber,
        userPassword,
        userGender,
        userLanguage,
        userRole: "USER",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

});

const getAllAdminUsers = asyncHandler( async (req, res) => {

    const { noOfDocsEachPage, currentPageNumber } = req.body;

    if(!noOfDocsEachPage || !currentPageNumber) {
        throw new ApiError(400, 'Pagination variables are missing')
    };

    const totalAdminUsers = await User.find({
        userRole: 'ADMIN'
    }).countDocuments();

    const allAdminUsers = await User.find({
        userRole : 'ADMIN'
    })
    .skip(noOfDocsEachPage * (currentPageNumber === 1 ? 0 : currentPageNumber))
    .limit(noOfDocsEachPage);

    if(!allAdminUsers) {
        throw new ApiError(404, 'No admin users found')
    }

    const data = {
        'totalDocuments': totalAdminUsers,
        'adminUsers': allAdminUsers
    }

    return res.status(200).json(
        new ApiResponse(200, data, 'All Admin Users Fetched Successfully')
    );
    
});

const getAllNormalUsers = asyncHandler( async (req, res) => {

    const { noOfDocsEachPage, currentPageNumber } = req.body;

    if(!noOfDocsEachPage || !currentPageNumber) {
        throw new ApiError(400, 'Pagination variables are missing')
    }

    const totalNormalUsers = await User.find({
        userRole : 'USER'
    }).countDocuments();

    const allNormalUsers = await User.find({
        userRole : 'USER'
    })
    .skip(noOfDocsEachPage * (currentPageNumber === 1 ? 0 : currentPageNumber))
    .limit(noOfDocsEachPage);

    if(!allNormalUsers) {
        throw new ApiError(404, 'No users found')
    }

    const data = {
        'totalDocuments': totalNormalUsers,
        'adminUsers': allNormalUsers
    }

    return res.status(200).json(
        new ApiResponse(200, data, 'All Users Fetched Successfully')
    );

});

const changeAdminAccountStatus = asyncHandler( async (req, res) => {

    const { adminId, newStatus } = req.body;

    if(!adminId || !newStatus) {
        throw new ApiError(400, 'Admin Id and New Status are required fields');
    }

    await User.findByIdAndUpdate(
        adminId,
        {
            $set: {
                userAccountStatus: newStatus
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, 'Admin account status has been changed successfully.')
    )

});

const changeUserAccountStatus = asyncHandler( async (req, res) => {

    const { userId, newStatus } = req.body;

    if(!userId || !newStatus) {
        throw new ApiError(400, 'User Id and New Status are required fields');
    }

    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                userAccountStatus: newStatus
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, 'User account status has been changed successfully.')
    )

});

const deleteAdminAccount = asyncHandler( async (req, res) => {

    const { adminId } = req.body;

    if(!adminId) {
        throw new ApiError(400, "Admin ID is missing.");
    }

    const adminDetails = await User.findById(adminId);

    if(adminDetails.userProfilePublicId) {
        await deletePreviousUserProfileImage(adminDetails.userProfilePublicId);
    }

    await User.findByIdAndDelete(adminId);

    return res.status(200).json(
        new ApiResponse(200, {}, 'Admin account has been deleted successfully.')
    )

});

const deleteUserAccount = asyncHandler( async (req, res) => {

    const { userId } = req.body;

    if(!userId) {
        throw new ApiError(400, "User ID is missing.");
    }

    const userDetails = await User.findById(userId);

    if(userDetails.userProfilePublicId) {
        await deletePreviousUserProfileImage(userDetails.userProfilePublicId);
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, {}, 'User account has been deleted successfully.')
    )

});


export {
    registerAdminUser,
    registerNormalUser,
    getAllAdminUsers,
    getAllNormalUsers,
    changeAdminAccountStatus,
    changeUserAccountStatus,
    deleteAdminAccount,
    deleteUserAccount
}