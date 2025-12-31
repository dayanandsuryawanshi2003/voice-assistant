import axios from "axios";
axios.defaults.withCredentials = true;
import React, { createContext, useState, useEffect } from "react";

export const UserDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "http://localhost:8000"

  const [userData, setUserData] = useState(null)
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true, 
      });
      setUserData(result.data);
      console.log("Current user:", result.data);
    } catch (error) {
      console.error(
        "Error fetching current user:",
        error?.response?.data || error.message
      );
     setUserData(null)
    }
  };

  const getGeminiResponse=async (command)=>{
    try {
      const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
      return result.data
    } catch (error) {
      console.error("Error asking assistant:", error?.response?.data || error.message);
      return null
    }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,userData,setUserData,backendImage,setBackendImage,
    frontendImage,setFrontendImage,selectedImage,setSelectedImage,getGeminiResponse
  };

  return (
    <div>
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
    </div>
  );
}

export default UserContext