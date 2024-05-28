import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        userFullName: {
            type: String,
            required: [true, 'Fullname is required'],
            unique: false,
            lowercase: false,
            trime: true,
            index: true,
        },
        userEmail: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        userPassword: {
            type: String,
            required: [true, 'Password is required'],
        },
        userProfileImage: {
            type: String, // Cloudinary Url
            required: false,
            default: '',
        },
        userProfilePublicId: {
            type: String,
            required: false,
            default: ''
        },
        userPhoneNumber: {
            type: String,
            required: [true, 'Phone Number is required'],
            unique: true,
        },
        userGender: {
            type: String,
            enum: ['MALE', 'FEMALE'],
            default: 'MALE',
            required: [true, 'Gender is required'],
        },
        userLanguage: {
            type: String,
            required: [true, 'Language is required'],
        },
        userRole: {
            type: String,
            enum: ['USER', 'ADMIN', 'SUPER-ADMIN'],
            default: 'USER',
        },
        userStatus: {
            type: String,
            enum: ['ONLINE', 'OFFLINE'],
            default: 'OFFLINE'
        },
        userAccountStatus: {
            type: String,
            enum: ['ACTIVE', 'DEACTIVE'],
            default: 'ACTIVE'
        },
        userRefreshToken: {
            type: String,
        }

    }, 
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("userPassword")) return next();

    this.userPassword = await bcrypt.hash(this.userPassword, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.userPassword)
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            userEmail: this.userEmail,
            userFullName: this.userFullName,
            userRole: this.userRole,
            userAccountStatus: this.userAccountStatus,
            userStatus: this.userSstatus,
            userPhoneNumber: this.userPhoneNumber,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

export const User = mongoose.model("User", userSchema)