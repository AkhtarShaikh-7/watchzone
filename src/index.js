// old env 
// require('dotenv').config({path: './env'})
// new appraoach
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
 
dotenv.config({
    path: "./"
})
connectDB();























/*
import express from "express";
const app = express();
app.get("/", (req, res) => {
    res.send("working")
})


    (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            //    listenner
            app.on("Error", (error) => {
                console.log("error", error);
                throw error
            });

            app.listen(process.env.PORT, () => {
                console.log(`server listening on port ${process.env.PORT}`);

            })
        } catch (error) {
            console.log("Error", error);
            throw error;

        }
    })()
        */