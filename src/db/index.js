import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';

const connectDB = async()=> {
    try {
        const connectionInctence =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInctence);
        
        console.log(`\n Mongodb connected !! DB HOST: ${connectionInctence.connection.host}`);
        
    } catch (error) {
        console.log("Error while connecting mongodb",error);;
        process.exit(1);
        
    }
    
}

export default connectDB;