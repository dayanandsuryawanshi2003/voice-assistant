import React, { useContext } from "react"
import { Routes, Route, Navigate} from "react-router-dom"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import Customize from "./pages/Customize"
import Customize2 from "./pages/Customize2"
import { UserDataContext } from "./context/UserContext"
import Home from './pages/Home'
import Dashboard from'./pages/Dashboard'
import { GoogleOAuthProvider } from '@react-oauth/google'

function App(){
  const {userData,setUserData}=useContext(UserDataContext)
  return(
    <GoogleOAuthProvider clientId="467706568381-d7beq9d29qv2mop54cd57agur15v2qaf.apps.googleusercontent.com">
      <Routes>
      <Route path='/' element={(userData?.assistantImage && 
        userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/> 
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/> 
      <Route path='/login' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
      <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
      <Route path="/dashboard" element={userData?<Dashboard /> : <Navigate to={"/customize"}/>}/>
      <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </GoogleOAuthProvider>
    

  )
}

export default App