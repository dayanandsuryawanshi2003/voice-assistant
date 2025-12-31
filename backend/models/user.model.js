import mongoose from "mongoose";

const assistantSchema = new mongoose.Schema({
  name: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
})

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
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
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    assistantName: {
        type: String,
        default: "Assistant" 
    }, 
    assistantImage: {
        type: String,
        default: "" 
    },
    history:[
        {type:String}
    ]
},{timestamps:true})

const User=mongoose.model("User",userSchema)
export default User