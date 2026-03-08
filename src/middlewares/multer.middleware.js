import multer from "multer";


// why we use this 
// we use multer to take input files and then we will save it on our server that means locally for tiny times then we will push this on cloudinary
// it is just middleware before push on cloud ye pahle kaam krega then cloud pr jyega


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb means callback and then gives parameter (null,location where to store files on server)=>
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix)
    cb(null,file.originalname)
  }
})

export const upload = multer({ 
    storage,
})