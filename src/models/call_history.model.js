import mongoose, {Schema} from "mongoose";

const callHistorySchema = new Schema(
    {
       
        firstPersonCaller: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        admin: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        secondPersonCalledTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            default: 0,
        },
        date: {
            type: String,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            default: '',
        },
        roomId: {
            type: String,
            required: true,
            unique: true
        },
        callStatus: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'NOT-RESPONDED', 'IN-PROGRESS', 'ENDED'],
            default: 'PENDING'
        },
        callType: {
            type: String,
            enum: ['INCOMING', 'QUEUED'],
            default: 'INCOMING'
        }

    }, 
    {
        timestamps: true
    }
);


export const CallHistory = mongoose.model("CallHistory", callHistorySchema);