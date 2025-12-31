import React, { useState,useContext,useRef } from 'react'
import {useNavigate} from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import axios from 'axios'
import { IoArrowBackCircleSharp } from "react-icons/io5"
function Customize2() {
  const {userData,backendImage,setBackendImage,selectedImage,setSelectedImage,serverUrl,setUserData} = useContext(UserDataContext)
  const [assistantName,setAssistantName]=useState(userData?.assistantName || "" )
  const [loading,setLoading]=useState(false)
  const navigate = useNavigate()

  
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setBackendImage(file)
      setSelectedImage(null)
      console.log("Selected file:", file)
    }
  }

  const handlePredefinedSelect = (url) => {
    setSelectedImage(url)
    setBackendImage(null) // clear file if any
    console.log("Selected predefined image:", url)
  }

  const handleUpdateAssistant=async ()=>{
    if(!assistantName.trim())
      return alert("enter assistant name!")
    if (!backendImage && (!selectedImage || selectedImage === "input")) {
      return alert("Please select an image");
      
    }

    setLoading(true)
    try {
      
      let formData=new FormData()
      formData.append("assistantName",assistantName)

      if(backendImage){
        formData.append("assistantImage",backendImage)
      }else if(selectedImage && selectedImage !== "input"){
        formData.append("imageUrl",selectedImage)
      }
     
      const result=await axios.post(`${serverUrl}/api/user/update`,formData,{withCredentials:true,
        headers: {"Content-Type": "multipart/form-data"}
      });
      
      
      if(result.data){
        setUserData(result.data)
        navigate("/")
      }
    } catch (error) {
      console.error("update assistant error:",error.response?.data || error.message)
    } finally{
      setLoading(false)
    }
  }
  return (
    <div  className='w-full h-[100vh] bg-[#121212] flex justify-center items-center flex-col p-[20px] relative'>
        <IoArrowBackCircleSharp className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px]  cursor-pointer' onClick={()=>navigate("/customize")}/>
     <h1 className='text-white text-[40px] text-center mb-[30px]'>Enter Your <span className='text-orange-300'>Assistant Name</span></h1>
     <input type="text" placeholder="eg. Queen" className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent 
     text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"
     required onChange={(e)=>setAssistantName(e.target.value)} />

     
     {assistantName && (<button  className='min-w-[300px] h-[60px] mt-[30px] text-white
      font-semibold bg-black rounded-full text-[19px] cursor-pointer' onClick={()=>{handleUpdateAssistant()}} disabled={loading}>
        {loading? "creating..": "Finally Create your Assistant"}
      </button>
     ) }
    </div>
  )
}

export default Customize2