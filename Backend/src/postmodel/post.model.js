const mongoose=require('mongoose')

const postschema=new mongoose.Schema({
    name: {
        type:String,
    required:true,
    unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otp:{
        type:Number,
        default:null,
    }
});
module.exports = mongoose.model("User", postschema);