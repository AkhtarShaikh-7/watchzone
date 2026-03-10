import {Router} from 'express'
import { loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route("/register").post(
    // this is a middleware : registeruser controller jaane se pahle multer se milnea ??
    upload.fields([
        {
            name:"avatar",
            maxCount:1,
        },{
            name:"coverImage",
            maxCount:1,
        }
    ]),
    // ye controller logic user details wala
    registerUser
);

router.route("/login").post(loginUser)


// secured routes using middleware using {auth.middleware.js}
router.route("/logout").post(verifyJWT,logoutUser) //verifyJWT iske last me next() ye bolta hai min done abb next kaam kro jbhi hai like (logoutuser)

export default router;