import {Router} from 'express'
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

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

export default router;