import React, {useContext}from 'react'
import { UserDataContext } from '../context/UserContext'

function Card({image}) {
    const {serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,
          selectedImage,setSelectedImage}=useContext(UserDataContext)
    const isSelected = selectedImage === image
  return (
    <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px]  border-2 border-[#020220] rounded-2xl  overflow-hidden
     hover:shadow-2xl hover:shadow-black/50 cursor-pointer hover:border-4 hover:border-white ${selectedImage == image? 
      "border-4 border-black shadow-2xl":null}`}
     onClick={()=>{setSelectedImage(image)
     setBackendImage(null)
     setFrontendImage(null)
    }}>
    <img src={image} className='h-full object-cover' />

    </div>
  )
}

export default Card