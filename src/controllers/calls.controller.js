import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { CallHistory } from "../models/call_history.model.js"
import { User } from '../models/user.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { formatTimeToString, formatUTCMillisecondsToDateString } from '../utils/TimeFormater.js'

const createNewIncomingCall = asyncHandler( async (req, res) => {

    const { userPhoneNumber } = req.body;

    if(!userPhoneNumber) {
        throw new ApiError(400, 'User phone number is required');
    }

    const existingUser = await User.findOne({
        userPhoneNumber: userPhoneNumber
    });

    if(!existingUser) {
        throw new ApiError(404, 'User with this phone number does not exists');
    }

    if(existingUser.userRole !== 'USER') {
        throw new ApiError(400, 'This user is not registered as a regular user');
    }

    if(existingUser.userAccountStatus === 'DEACTIVE') {
        throw new ApiError(400, 'This user account has been deactivated');
    }

    const date = new Date();
    const dateInUTCMilliseconds = date.getTime();
    const roomId = `${req.user._id}-${process.env.ANDY_DOE_ADMIN_ID}-${existingUser._id}`;

    const call = await CallHistory.create({
        firstPersonCaller: req.user._id,
        admin: process.env.ANDY_DOE_ADMIN_ID,
        secondPersonCalledTo: existingUser._id,
        date: date,
        roomId: roomId,
        startTime: dateInUTCMilliseconds,
    });

    const createdCall = await CallHistory.findOne(call._id).populate(['firstPersonCaller', 'secondPersonCalledTo']);

    if (!createdCall) {
        throw new ApiError(500, "Something went wrong while creating a call")
    }

    return res.status(200).json(
        new ApiResponse(200, createdCall, 'New incoming call has been created')
    )

});

const changeCallStatus = asyncHandler( async (req, res) => {

    const { callId, newCallStatus } = req.body;

    if(!callId) {
        throw new ApiError(400, 'Call ID is missing');
    }

    const updatedCall = await CallHistory.findByIdAndUpdate(callId, {
        $set: {
            callStatus: newCallStatus,
        }
    }, {new: true});

    return res.status(200).json(
        new ApiResponse(200, updatedCall, 'Call status has been updated')
    );

});

const changeCallType = asyncHandler( async (req, res) => {

    const { callId, newCallType } = req.body;

    if(!callId) {
        throw new ApiError(400, 'Call ID is missing');
    }

    const updatedCall = await CallHistory.findByIdAndUpdate(callId, {
        $set: {
            callType: newCallType,
        }
    }, {new: true});

    return res.status(200).json(
        new ApiResponse(200, updatedCall, 'Call type has been updated')
    );

});

const makeCallEnded = asyncHandler( async (req, res) => {

    const { callId, newTimeDuration } = req.body;

    if(!callId || !newTimeDuration) {
        throw new ApiError(400, 'Required fields are missing');
    }

    const callTimeEnded = new Date().getTime();

    const endedCall = await CallHistory.findByIdAndUpdate(
        callId,
        {
            $set: {
                duration: newTimeDuration,
                callStatus: 'ENDED',
                endTime: callTimeEnded,
            }
        },
        {
            new: true
        }
    );

    return res.status(200).json(
        new ApiResponse(200, endedCall, 'Call ended successfully')
    )

});


export {
    createNewIncomingCall,
    changeCallStatus,
    changeCallType,
    makeCallEnded
}