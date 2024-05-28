import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { CallHistory } from "../models/call_history.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { DEFAULT_ITEM_PER_PAGE } from "../constants.js";


const getAdminCalls = asyncHandler( async (req, res) => {

    let { callStatus, callType, noOfDocsEachPage, currentPageNumber } = req.query;

    if(callStatus === '' || callType === '') {
        throw new ApiError(400, 'Call status and type are required!');
    }
    
    const adminId = req.user._id;
    currentPageNumber = parseInt(currentPageNumber);
    noOfDocsEachPage = parseInt(noOfDocsEachPage);

    const totalDocsCount = await CallHistory.find({
        admin: adminId,
        callStatus: callStatus, 
        callType: callType
    }).countDocuments();

    const adminCalls = await CallHistory.find({
        admin: adminId,
        callStatus: callStatus, 
        callType: callType
    })
    .populate(['firstPersonCaller', 'secondPersonCalledTo'])
    .skip(noOfDocsEachPage * (currentPageNumber === 1 ? 0 : currentPageNumber))
    .limit(noOfDocsEachPage);

    const totalPages = Math.ceil(totalDocsCount / DEFAULT_ITEM_PER_PAGE) || 0;

    const data = {
        'totalDocuments': totalDocsCount,
        'calls': adminCalls,
        'totalPages': totalPages
    }

    return res.status(200).json(
        new ApiResponse(200, data, `Admin ${callType} - ${callStatus} calls has been fetched successfully`)
    );

});

const getAdminStats = asyncHandler( async (req, res) => {
    const adminId = req.user._id;
    let avgHoldTime = 0;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let day = currentDate.getUTCDate();

    let prevDay = Math.abs(day - 7);
    const previousDate = new Date(year, month, prevDay, 0,0,0);

    console.log(day);
    console.log(prevDay);
    console.log(previousDate);
    console.log(currentDate);

    const totalQueuedCalls = await CallHistory.find({
        admin: adminId,
        callType: 'QUEUED',
        callStatus: 'PENDING',
    }).countDocuments();

    const totalIncomingCalls = await CallHistory.find({
        admin: adminId,
        callType: 'INCOMING',
        callStatus: 'PENDING'
    }).countDocuments();

    const totalEndedCalls = await CallHistory.find({
        admin: adminId,
        callType: 'INCOMING',
        callStatus: 'ENDED'
    }).countDocuments();

    const allEndedCallsDocs = await CallHistory.find({
        admin: adminId,
        callType: 'INCOMING',
        callStatus: 'ENDED'
    });

    allEndedCallsDocs.map((doc) => {
        avgHoldTime += doc.duration;
    });

    avgHoldTime = Math.ceil(avgHoldTime / totalEndedCalls);

    const callsThisWeek = await CallHistory.find({
        $and: [
            { admin: adminId },
            { callType: 'INCOMING' },
            { callStatus: "ENDED" },
            { date: { $gt : previousDate } }
        ]
    }).countDocuments();

    const data = {
        'queueCalls' : totalQueuedCalls,
        'incomingCalls' : totalIncomingCalls,
        'avgHoldTime' : avgHoldTime,
        'callsThisWeek' : callsThisWeek
    };

    return res.status(200).json(
        new ApiResponse(200, data, 'Successfully retrieved dashboard data')
    );

    
});


export {
    getAdminCalls,
    getAdminStats
}