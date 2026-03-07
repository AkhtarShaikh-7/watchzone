import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// this is just configrations
// --------------------------
// we use use to showes we r using middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
// to accept data from frontend from form in json we use this also set limit to avoid datbase crashes
app.use(express.json({limit:"16kb"}));
// to get data from url or in url we use this method also set limit to avoid crashes db
app.use(express.urlencoded({
    extended: true,limit: "16kb"
}))
// to store pdf images in our server we use this or also give file name e.g public
app.use(express.static("public"));


// ---------
// we use cookie parseer to set cookies in user browser using server only or perform crud operation
app.use(cookieParser());
// ---------------------------------------
export default app;