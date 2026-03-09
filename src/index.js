// old env 
// require('dotenv').config({path: './env'})
// new appraoach
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from './app.js';
 
dotenv.config({
    path: "./.env"
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
   console.log("Mongo db connection failed !!!",err);
   
})




























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