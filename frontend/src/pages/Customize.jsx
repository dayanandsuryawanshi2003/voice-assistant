import React, { useState,useRef,useContext } from 'react'
import Card from '../components/Card'

import { RiImageAddFill } from "react-icons/ri";
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { IoHomeSharp } from "react-icons/io5";
function Customize() {
  const {serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,
        selectedImage,setSelectedImage}=useContext(UserDataContext)
  const navigate=useNavigate()
  const inputImage=useRef()

  const handleImage=(e)=>{
    const file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }
  const images = [
    "/assets/assist1.jpg",
    "/assets/assist2.jpg",
    "/assets/assist3.png",
    "/assets/assist4.png",
    "/assets/assist5.png",
    "/assets/assist6.png",
    "/assets/assist7.jpeg"
  ];

  return (
    <div className='w-full h-[100vh] bg-[#121212] flex justify-center items-center flex-col p-[20px] ' >
      <IoHomeSharp className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px]  cursor-pointer' onClick={()=>navigate("/")}/>
      <h1 className='text-white text-[40px] text-center mb-[30px]'>Select your <span className='text-orange-300'>Assistant Image</span> </h1>
      <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]'>
      
       {images.map((img,i)=>(<Card key={i} image={img}/>))}

        <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px]   border-2 border-black rounded-2xl  overflow-hidden
         hover:shadow-2xl hover:shadow-black cursor-pointer hover:border-4 hover:border-white flex items-center justify-center
         ${selectedImage=="input"?"border-4 border-white shadow-2xl shadow-black":""}`}
         onClick={()=>{inputImage.current.click()
          setSelectedImage("input")}
         }>
          {!frontendImage && <RiImageAddFill className='text-white w-[25px] h-[25px]'/>}
          {frontendImage && <img src={frontendImage} className='h-full object-cover'/>}
         
        </div>
        <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage}/>
      </div>
    {selectedImage && <button  className='min-w-[150px] h-[60px] mt-[30px] text-white
       font-semibold bg-black rounded-full text-[19px] cursor-pointer' onClick={()=>navigate("/customize2")}>Next</button>}
    </div>
  )
}

export default Customize