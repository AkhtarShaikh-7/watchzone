import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

    const { username, email, fullname, password } = req.body
    console.log("email:", email);

    // we are checking here if it is empty or not validation
    if (
        [username, email, fullname, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required");

    }
    // here we are checking in database which user making id here it is existed or not if exist throw erro (user existed);
    // help of USer model who gives use permission directlt into db
    // findOne is a method in which we get operators lik or , and
    const existedUser = User.findOne({
        $or: [{ username }, { email }] //in [] we can take any num of fields to check exoted or not
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already existed ")
    }

    // ?????
    // multer gives acces of files which we can taken by frontend
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    // chcek ones console log ???
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is required");;

    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
        
    }

    // save all information in database using "User"??
   const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "", // it is not required and we didnt chekced we have or not that's why we checked here if its then ok other " "
        email,
        password,
        username:username.toLowerCase(),

    });
    // we are caaling again in db to check with _id means user craeted or  not it null??
    const createdUser = await User.findById(user._id).select(
        // what select does by default all is seelcted we write here what we do not need
        "-password -refreshToken" // ye 2 nhi chiye
    );

    // check user ctrreated or not if not mistake our means server??
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user");
    }

    // we are retuning user from database after created in db successfully
    // return res.status(201).json({createdUser});

    // we have alraedy defind class that how we can send our response in structured way just make object using {new}keyword??
    return res.status(2001).json(
        new ApiResponse(200, createdUser, "user registerd successfully")
    )

})

export { registerUser };