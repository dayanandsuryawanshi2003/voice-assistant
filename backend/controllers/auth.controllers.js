import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../config/token.js"
 
export const signUp=async(req,res)=>{
try {
    const{name,email,password}=req.body

    const existEmail=await User.findOne({email})
    if(existEmail){
        return res.status(400).json({message:"email already exists!"})
    }
    if(password.length<6){
        return res.status(400).json({message:"password must be at least 6 characters !"})
    }
    const hashPassword=await bcrypt.hash(password,10)
    const user=await User.create({
        name,email,password:hashPassword
    })

    const token =  genToken(user._id)
    res.cookie("token",token,{
        httpOnly:true,
        maxAge:10*24*60*60*1000,
        sameSite:"none",
        secure:true ,
        path: "/"
    })
    return res.status(201).json(user)
} catch (error) {
    return res.status(500).json({message:`sign up error ${error}`})
}
}

export const Login=async(req,res)=>{
try {
    const{email,password}=req.body

    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"email does not exists!"})
    }
    if(!user.password) return res.status(400).json({message:"Login not available for Google user.Use Google Sign-In."})

    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        return res.status(400).json({message:"Incorrect password"})
    }

    const token = genToken(user._id)

    res.cookie("token",token,{
        httpOnly:true,
        maxAge:10*24*60*60*1000,
        sameSite:"none",
        secure:true ,
        path:"/"
    })
    
    return res.status(200).json(user)

} catch (error) {
    return res.status(500).json({message:`Login error ${error}`})
}
}


export const googleSignIn = async (req, res) => {
    try {
        const { email, name, picture } = req.body;
    
        let user = await User.findOne({ email });

        if (!user) {
            
            user = await User.create({
                name,
                email,
                assistantImage: picture, 
                isGoogleUser: true 
            });
        }
        const token = genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 10 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
            path: "/"
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Google Sign-In error ${error}` });
    }
}

export const logOut=async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:'Log out successfully'})
    } catch (error) {
        return res.status(500).json({message:`Logout error ${error}`})
    }
}
