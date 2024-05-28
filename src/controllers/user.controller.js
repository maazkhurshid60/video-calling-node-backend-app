import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { CallHistory } from "../models/call_history.model.js"
import { uploadOnCloudinary, deletePreviousUserProfileImage } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateOTP } from "../utils/helpful_methods.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import mailer from '../utils/mailer.js';

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const userAccessToken = user.generateAccessToken()
        const userRefreshToken = user.generateRefreshToken()

        user.userRefreshToken = userRefreshToken
        await user.save({ validateBeforeSave: false })

        return {userAccessToken, userRefreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {userFullName, userEmail, userPhoneNumber, userPassword, userGender, userLanguage } = req.body
    //console.log("email: ", email);

    if (
        [userFullName, userEmail, userPhoneNumber, userPassword, userGender, userLanguage].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUserWithEmail = await User.findOne({
        $or: [{ userEmail }]
    })

    if (existedUserWithEmail) {
        throw new ApiError(409, "User with email already exists")
    }

    const existedUserWithPhoneNumber = await User.findOne({
        $or: [{ userPhoneNumber }]
    })

    if (existedUserWithPhoneNumber) {
        throw new ApiError(409, "User with phone number already exists")
    }

    const user = await User.create({
        userFullName,
        userEmail,
        userPhoneNumber,
        userPassword,
        userGender,
        userLanguage,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )

});

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {userEmail, userPassword} = req.body

    if (!userEmail) {
        throw new ApiError(400, "Email is required")
    }

    if (!userPassword) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{userEmail}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if(user.userAccountStatus === 'DEACTIVE') {
        throw new ApiError(400, "Your account has been deactivated.")
    }

   const isPasswordValid = await user.isPasswordCorrect(userPassword)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

    const {userAccessToken, userRefreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    loggedInUser.userStatus = 'ONLINE';
    loggedInUser.save({validateBeforeSave: false});

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("userAccessToken", userAccessToken, options)
    .cookie("userRefreshToken", userRefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, userAccessToken, userRefreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            },
            $set: {
                userStatus: "OFFLINE",
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("userAccessToken", options)
    .clearCookie("userRefreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.userRefreshToken || req.body.userRefreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.userRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {userAccessToken, newUserRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", userAccessToken, options)
        .cookie("refreshToken", newUserRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {userAccessToken, refreshToken: newUserRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

});

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
});

const updateUserAccountDetails = asyncHandler(async(req, res) => {
    const {userFullName, userEmail, userPhoneNumber } = req.body

    if (!userFullName || !userEmail || !userPhoneNumber) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                ...req.body,                
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserProfileImage = asyncHandler(async(req, res) => {
    const profileImageLocalPath = req.file?.path

    console.log(req.file);

    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile Image file is missing")
    }

    //TODO: delete old image - assignment

    if(req.user?.userProfilePublicId) {
        await deletePreviousUserProfileImage(req.user.userProfilePublicId)
    }

    const profileImage = await uploadOnCloudinary(profileImageLocalPath)

    if (!profileImage.url) {
        throw new ApiError(400, "Error while uploading on profileImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                userProfileImage: profileImage.url,
                userProfilePublicId: profileImage.public_id,
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Profile image updated successfully")
    )
});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {userOldPassword, userNewPassword} = req.body

    if(!userOldPassword || !userNewPassword){ 
        throw new ApiError(400, "Both old and new password are required");
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(userOldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.userPassword = userNewPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
});

const changeUserPassword = asyncHandler(async(req, res) => {
    const {email, userNewPassword} = req.body

    if(!email || !userNewPassword){ 
        throw new ApiError(400, "New password is required");
    }

    const user = await User.findOne({ userEmail: email });

    user.userPassword = userNewPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
});

const deleteMyAccount = asyncHandler( async (req, res) => {

    const userDetails = await User.findById(req.user._id);

    if(userDetails.userRole === 'SUPER-ADMIN') {
        throw new ApiError(400, 'Unauthorized Action');
    }

    if(userDetails.userProfilePublicId) {
        await deletePreviousUserProfileImage(userDetails.userProfilePublicId);
    }

    await User.findByIdAndDelete(req.user._id);
    await CallHistory.deleteMany({
        $or: [
            { firstPersonCaller:  req.user._iq},
            { secondPersonCalledTo:  req.user._iq}
        ]
    });

    return res.status(200).json(
        new ApiResponse(200, {}, 'Your account has been deleted successfully.')
    )

});

const getUserCallLogs = asyncHandler( async (req, res) => {

    const userId = req.user._id;

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let day = currentDate.getUTCDate();

    let prevDay = Math.abs(day - 7);
    const previousDate = new Date(year, month, prevDay, 0,0,0);

    const callLogs = await CallHistory.find({
        $or: [
            { firstPersonCaller: userId },
            { secondPersonCalledTo: userId }
        ],
        $and: [
            { callStatus: 'ENDED'},
            { date: { $gt : previousDate } }
        ],
        
    }).populate(['firstPersonCaller', 'secondPersonCalledTo']);

    return res.status(200).json(
        new ApiResponse(200, callLogs, 'Call logs fetched successfully!')
    );

});

const sendUserOTP = asyncHandler( async (req, res) => {

    const { email } = req.body;

    const otp = generateOTP(4);

    const response = {
        'otp' : otp,
        'requestedEmail' : email, 
    };

    // Implement Send Email Functionality

    const isTsVerified = await mailer.transporter.verify();

    console.log(isTsVerified);
    
    const responseEmail = await mailer.transporter.sendMail({
        subject: "OTP Verification",
        from: process.env.MAILER_USER_EMAIL,
        to: email,
        text: `Hi ${email}, your OTP is ${otp}. Please do not share this with anyone`,
    });

    console.log(responseEmail.response);

    return res.status(200).json(
        new ApiResponse(200, response, 'OTP sent successfully!')
    );

});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserProfileImage,
    getCurrentUser,
    updateUserAccountDetails,
    changeCurrentPassword,
    changeUserPassword,
    deleteMyAccount,
    getUserCallLogs,
    sendUserOTP
}



//// Code For Profile Image

/**
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
*/