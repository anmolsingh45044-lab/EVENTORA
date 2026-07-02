const user = require('../postmodel/post.model');
const { sendOtpEmail }=require('../utils/email')
const jwt=require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const otp =require('../postmodel/otp')


//webtoken
const generateToken=(id,role)=>{
    return jwt.sign({id,role},process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
}

//registeration

exports.registerUser=async(req,res)=>{
    const{name,email,password}=req.body;
    

    let userExists=await user.findOne({email});
    if(userExists){
        return res.status(400).json({error:"user already exists"})
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    try{
        const newUser = await user.create({name,email,password:hashedPassword,role:'user',isVerified:false});
       
        const otpCode=Math.floor(100000+Math.random()*900000).toString();
        console.log(`otp for ${email}: ${otpCode}`);
        await otp.create({
            email,
            otp:otpCode,
            action:'account_verification'
        });
        await sendOtpEmail(email,otpCode,'account_verification');

        res.status(201).json({message:'User registered successfully'})


    } catch (error) {
        res.status(500).json({message:'Error registering user', error})
    }
};


// login
exports.loginUser=async(req,res)=>{
    const{email,password}=req.body;

    let existingUser=await user.findOne({email});
    if(!existingUser){
        return res.status(400).json({error:"Invalid credentials"})
    }

    const isMatch=await bcrypt.compare(password,existingUser.password);
    if(!isMatch){
        return res.status(400).json({error:"Invalid credentials"})
    }
    
    if(!existingUser.isVerified){
        const otpCode=Math.floor(100000+Math.random()*900000).toString();
        await otp.deleteMany({email,action:'account_verification'});
        await otp.create({email,otp:otpCode,action:'account_verification'});
        await sendOtpEmail(email,otpCode,'account_verification');
        return res.status(400).json({
            error:"Account not verified. OTP sent to email."
        })
    }
   res.json({
    message:'Login successfully',
    _id:existingUser._id,
    name:existingUser.name,
    email:existingUser.email,
    role:existingUser.role,
    token:generateToken(existingUser._id,existingUser.role)
   })


}


//verify otp
exports.verifyOtp=async(req,res)=>{
    const{email,otp:otpCode}=req.body;
    const otpRecord = await otp.findOne({email,otp:otpCode,action:'account_verification'});

    if(!otpRecord){
        return res.status(400).json({error:"Invalid OTP"})
    }

    const existingUser =await user.findOneAndUpdate({email},{isVerified:true},{new:true});
    await otp.deleteMany({email,action:'account_verification'});

    res.json({
        message:"Account verified successfully",
        _id:existingUser._id,
        name:existingUser.name,
        email:existingUser.email,
        role:existingUser.role,
        token:generateToken(existingUser._id,existingUser.role)
    })
}
    

