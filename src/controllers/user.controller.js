import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


// creating method to gives token we gives again and gain so we r creating method
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // function me userID joo melega usse ham db se user ka infomation le lenge and user me save krdenge
        const user = await User.findById(userId);
        const accesstoken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // hamne dono tokens ko generate kr liye

        // now abb refershtoken ko add krna hai db me qki hamrepass object aagya hai yha par user name se so usem add krdo
        user.refreshToken - refreshToken
        await user.save({ validateBeforeSave: false }) //we get this method in mongoose matlab password mat check kro direct save krdo db me refersh token ko

        // kaam hone ke baad user ko bhi dena hai dono token so return krdo
        return { accesstoken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frintend
    // validation - not empty
    //  check if user already exists: username, email
    //  check images, check fro avatar
    //  upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check fro user creation
    // return response 

    const { username, email, fullName, password } = req.body
    // console.log("email:", email);
    // console.log("console kiya req.body",req.body);


    // we are checking here if it is empty or not validation
    if (
        [username, email, fullName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required");

    }
    // here we are checking in database which user making id here it is existed or not if exist throw erro (user existed);
    // help of USer model who gives use permission directlt into db
    // findOne is a method in which we get operators lik or , and
    const existedUser = await User.findOne({
        $or: [{ username }, { email }] //in [] we can take any num of fields to check exoted or not
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already existed ")
    }

    // console.log("log req.files",req.files);

    // ?????
    // multer gives acces of files which we can taken by frontend
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // chcek ones console log ???
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is required");;

    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);


    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");

    }

    // save all information in database using "User"??
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // it is not required and we didnt chekced we have or not that's why we checked here if its then ok other " "
        email,
        password,
        username: username.toLowerCase(),

    });
    // we are caaling again in db to check with _id means user craeted or  not it null??
    const createdUser = await User.findById(user._id).select(
        // what select does by default all is seelcted we write here what we do not need
        "-password -refreshToken" // ye 2 nhi chiye
    );

    // check user ctrreated or not if not mistake our means server??
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user");
    }

    // we are retuning user from database after created in db successfully
    // return res.status(201).json({createdUser});

    // we have alraedy defind class that how we can send our response in structured way just make object using {new}keyword??
    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registerd successfully")
    )

});

const loginUser = asyncHandler(async (req, res) => {
    // req.body - data
    // usernamer or email
    // find the user
    //password check
    // access and refresh token
    // send cookie

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // now check password
    // take user joo return hua hai db se na ki schema wala USer 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    // if password correct hai tu login dedo means refreshtoken and accesstoken dedo 
    // abb iske liye hmane methods bna diye hai so call kro aur lelo
    const { accesstoken, refreshToken } = await generateAccessAndRefreshTokens(user._id) // method ko call kiya and user ke throw _id pass kr diye and return me mujhe tokens mil rhe hai use var me sav krlo
    // yha par joo user hai usme joo token key hai woo empty hai so phirse db call krn padega??
    // qki tokejns to hamne line number 155 pe set kiya hai methods ko call krke islye?

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")  // {select} me woo type kro joo db se nhi chiye

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accesstoken, options) //token key:value and options kuch hai 
        .cookie("refreshToken", refreshToken, options)
        //return me json bhej rhe hai uske sath joobhi details send krni hoo in objects send krdo
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accesstoken, refreshToken
            },
                "User logged in successfully"
            )
        )
});



// logout user
const logoutUser = asyncHandler(async (req, res) => {
    //    iske routes se mujhe mil rha hai req.body middleware se
    // req.user._id
    await User.findByIdAndUpdate(
        req.user._id, {
        //set to set anything in db
        $set: {
            refreshToken: undefined
        }
    },
        //aur bhi kaam kr skte hai iske sath me
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
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"));
})

// referesh token refresh end point
const refereshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    // ye melega laptop ya desktop se req.cookie.refreshToken ||  agr ksis ne mobil se hit kiya tu yha se melega req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");

    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        // cookiees
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accesstoken, newRefreshToken } = await generateAccessAndRefreshTokens(user?._id)

        return res
            .status(200)
            .cookie("accessToken", accesstoken, options)
            .cooki("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accesstoken, refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.body?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(200, req.user, "current user fetched successfully")
})


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!(fullName || email)) {
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(
        // ye req.id middleware se arha hai shayd qki wo return kr rh tha if usr login hai tu
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    // file kaise lena hai
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    // db me save krna hai use kro ye method findByIdAndUpdate nad kiska krna hai ye req.user?._id ye id ka
    // kya set krn  hai avatar kisese set krma hai avatar.url  abb return krdo user ko ye new:true   bss password mat send kro select("-password")
   const user=  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        }, { new: true }
    ).select("-password"); 

    return res.status(200)
    .json(new ApiResponse(200,user,"avatar image updated successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
};