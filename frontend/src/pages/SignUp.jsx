import React,{useState, useContext} from "react"
//import bg from "../assets/sign2.jpg";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import {useNavigate} from 'react-router-dom';
import { UserDataContext } from "../context/UserContext";
import axios from "axios"
function SignUp() {
  const[showPassword,setShowPassword]=useState(false)
  const {serverUrl,setUserData}=useContext(UserDataContext)
  const navigate=useNavigate()

  const [name,setName]=useState("")
  const[email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const[loading,setLoading] = useState(false)
  const [err,setErr]=useState("")
  
  const handleSignUp=async (e)=>{
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result=await axios.post(`${serverUrl}/api/auth/signup`,{
        name,email,password
      },{withCredentials:true})
      setUserData(result.data)
      setLoading(false)
      navigate("/customize2")
    } catch (error) {
      console.log(error)
      setUserData(null)
      setLoading(false)
      setErr(error.response?.data?.message)
    }
  }
  return (
      <div
      className="
        w-full h-screen flex flex-col items-center justify-center
        bg-cover bg-no-repeat
        bg-center
        bg-[url('/src/assets/sign_mob.jpg')]
        md:bg-top
        md:bg-[url('/src/assets/sign_desk.jpg')]
        md:bg-center
      "
    >
     <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000000] 
      backdrop-blur shadow-lg shadow-black flex flex-col items-center 
      justify-center gap-[20px] px-[20px]' onSubmit={handleSignUp}>
      <h1 className='text-white text-[30px] font-semibold mb-[30px]'>Register to 
      <span className='text-orange-400'> Virtual Assistant</span></h1>
      <input type="text" placeholder='Enter your name' className='w-full
       h-[60px] outline-none border-2 border-white bg-transparent 
       text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full 
       text-[18px]' required onChange={(e)=>setName(e.target.value)} value={name}/>
       <input type="email" placeholder='Email' className='w-full 
       h-[60px] outline-none border-2 border-white bg-transparent 
       text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full 
       text-[18px]' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
      <div className='w-full h-[60px] border-2 border-white bg-transparent 
        text-white rounded-full text-[18px] relative'>
        <input type={showPassword?"text":"password"} placeholder='password' className='w-full 
         h-full  rounded-full outline-none bg-transparent 
         placeholder-gray-300 px-[20px] py-[10px]' required onChange={(e)=>setPassword(e.target.value)}
         value={password}/>
        {!showPassword && <FaEye className='absolute top-[18px] right-[20px] 
        text-[white] w-[25px] h-[25px] cursor-pointer' 
        onClick={()=>setShowPassword(true)}/>}
        {showPassword && <FaEyeSlash className='absolute top-[18px] right-[20px]
        text-[white] w-[25px] h-[25px] cursor-pointer'
        onClick={()=>setShowPassword(false)}/>}
      </div>
      {err.length>0 && <p className='text-red-500 text-[17px]'>
        *{err}
        </p>}
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black 
       font-semibold bg-white rounded-full text-[19px]' disabled=
       {loading}>{loading?"Loading...":"Sign Up"}
      </button>
      <p className='text-[white] text-[18px] cursor-pointer' onClick={()=>
        navigate("/signin")}>Already have an account ?
      <span className='text-yellow-400'>Sign In</span></p>
     </form>
     <div className='w-full h-[60px] bg-[#00000000]  fixed bottom-0 flex 
        items-center justify-center text-black text-[20px]'>
        <marquee behavior="scroll" direction="left" scrollamount="5"><b>
         Step In & Discover magic | Made with  ideas of Dayanand, Shubham, Pratik ...!!</b>
       </marquee>
      </div>
   </div>
  
  )
}

export default SignUp