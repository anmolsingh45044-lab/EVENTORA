const mongoose=require('mongoose')


async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("connected to database")
   })
   .catch((err)=>{
    console.log('error in connecting to database',err)
   })
}

module.exports=connectDB;
