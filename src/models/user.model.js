import mongoose, { Schema } from 'mongoose'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true,
            index: true,

        },
        email: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary
            required: true,


        },
        coverImage: {
            type: String,
        },

        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
        ], password: {
            type: String,
            required: [true, "Password is required"],
            unique: true
        },
        refreshToken: {
            type: String,
        },

    }, { timestamps: true }
);
// this is called plugin just data sAVE krne se pahle kuch kaam karo (methods avaliable hai : save , delete).save krne se pahle paswprd hash kro
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return ;

    this.password = await bcrypt.hash(this.password, 10);
    // next();    // in monggose v7+ version me built in hai so dotn use it caises error
})
// creating custom methods just checking password is correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

// session jwt
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User", userSchema);