import path from "path"
import User from "../models/user.model.js"
import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import moment from "moment"
import geminiResponse from "../gemini.js"

const uploadToCloudinary = async (filePath, folder = "avatars") => {
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            throw new Error("File path does not exist");
        }
        const result = await cloudinary.uploader.upload(filePath, { folder: "avatars", resource_type: "auto" });
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return result.secure_url
    } catch (error) {
        console.error("Cloudinary error:", error.message);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return null;
    }
}

export const getCurrentUser=async(req,res)=>{
    try {
        const user=await User.findById(req.userId).select("-password")
        if(!user){
           return res.status(404).json({message:"user not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        console.error("getCurrentUser error:", error);
        return res.status(500).json({message:"get current user error"})
    }
}
export const updateAssistant= async (req,res)=>{
    try {
        console.log("req.body:", req.body)
        console.log("req.file:", req.file)
        const {assistantName,imageUrl}=req.body;
        let assistantImage =null;
        if(req.file){
            const absolutePath = path.resolve(req.file.path);
            console.log("Uploading from corrected path:", absolutePath);
            assistantImage=await uploadToCloudinary(absolutePath);
        }else if(imageUrl && imageUrl !== "input"){
            assistantImage=imageUrl;
        }
       
        if (!assistantName) {
            return res.status(400).json({ message: "Assistant name required" });
        }

        const updateData = { assistantName };
        if (assistantImage) {
            updateData.assistantImage = assistantImage;
        }
        const user=await User.findByIdAndUpdate(req.userId, updateData,/*{
            assistantName,assistantImage},*/
        {new:true}).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user)
    } catch (error) {
        console.error("Update Assistant Error:",error)
        return res.status(500).json({message: error.message || "Internal server error"})
    }
}

export const askToAssistant=async (req,res)=>{
    try{
        if (!req.userId) {
            return res.json({  type: "error",
        response: "Unauthorized", });
        }
        const {command}=req.body
          if (!command || !command.trim()) {
      return res.json({  type: "general",
        response: "Please say something.", });
    }
    
        const user= await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" })
        user.history.push(command)
        await user.save()

         
        const rawGemini = await geminiResponse(
          command,
          user.assistantName,
          user.name
        );
        
        let gem;
        
        try {
         gem = typeof rawGemini === "string"
         ? JSON.parse(rawGemini)
         : rawGemini;
        } catch (err) {
           console.error("Gemini JSON parse failed:", rawGemini);
           return res.json({
           type: "general",
           userInput: command,
           response: "Sorry, I didn't understand that.",
        });
        }
        
        if (!gem || !gem.type) {
          return res.json({
          type: "general",
          userInput: command,
          response: "Sorry, I didn't understand that."
        });
        }

        switch(gem.type){
            case 'get-date':
                return res.json({
                    type:gem.type,
                    response:`current date is ${moment().format("YYYY-MM-DD")}`,
                });
            case 'get-time':
                 return res.json({
                    type: gem.type,
                    response:`current time is ${moment().format("hh:mm A")}`,
                });
            case 'get-day':
                 return res.json({
                    type: gem.type,
                    response:`today is a ${moment().format("dddd")}`,
                });
            case 'get-month':
                 return res.json({
                    type: gem.type,
                    response:`current month is ${moment().format("MMMM")}`,
                });
            default:
                 return res.json({
                   type: gem.type,
                   userInput: gem.userInput || command,
                   response: gem.response || "Here is your answer!",
                });
        }
    }catch(error){
        console.error("askToAssistant Error:", error);
    return res.json({
      type: "general",
      response: "something went wrong,please try again",
    });

    }
}
