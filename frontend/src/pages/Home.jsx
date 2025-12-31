import React, { useContext, useRef, useState, useEffect } from 'react'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/aivoice.gif"
import { ImMenu2 } from "react-icons/im";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/uservoice.gif"
import { ImExit } from "react-icons/im";
import { RxAvatar } from "react-icons/rx";


function Home() {
  const {userData,serverUrl,setUserData,getGeminiResponse}=useContext(UserDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const [ham,setHam]=useState(false)
  const [micOn, setMicOn] = useState(true)
  const synth=window.speechSynthesis
  const recognitionRef=useRef(null)
  const isSpeakingRef=useRef(false)
  const isRecognizingRef=useRef(false)
  const micDisabledRef = useRef(false)
  const openedTabRef = useRef(null)

  const handleLogOut=async ()=>{
    try {
      await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

   // ✅ open tab helper
  const openNewTab = (url) => {
    if (openedTabRef.current && !openedTabRef.current.closed) {
      openedTabRef.current.close()
    }
    openedTabRef.current = window.open(url, "_blank")
  }

  const startRecognition=()=>{
    if (micDisabledRef.current) return
    if(!isSpeakingRef.current && !isRecognizingRef.current && recognitionRef.current){
    try{
      recognitionRef.current.start();
      setListening(true);
    }catch(error){
        console.error("Start error:",error);
    }
  }}
  const toggleMic = () => {
    if (micOn) {
      // 🔴 HARD MIC OFF
      micDisabledRef.current = true
      setMicOn(false)

      try {
        recognitionRef.current?.abort() // IMPORTANT
      } catch {}

      try {
        synth.cancel()
      } catch {}

      isRecognizingRef.current = false
      isSpeakingRef.current = false
    } else {
      // 🎤 MIC ON
      micDisabledRef.current = false
      setMicOn(true)
      startRecognition()
    }
  }
  const speak=(text)=>{
    if (!text) return
    if (synth.speaking) {
            try { synth.cancel() } catch (e) { console.error("Cancel error:", e) }
        }
    
    try { recognitionRef.current.stop(); } catch (e) {}
    const utterence=new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices()
    const hindivoice = voices.find(v => v.lang === 'hi-IN');
    if(hindivoice){
      utterence.voice = hindivoice;
    }
    try { synth.cancel() } catch (e) {}
    isSpeakingRef.current=true
    utterence.onend=()=>{
      setAiText("")
      isSpeakingRef.current=false
      setTimeout(()=> {
      startRecognition();
    },800);
  }
  
  synth.speak(utterence);
  }
  const handleCommand=(data)=>{
    const{type, userInput, response}=data;
    speak(response);
   
    if(type === 'google-search'){
      const query = encodeURIComponent(userInput);
      openNewTab(`https://www.google.com/search?q=${query}`);
    }
    if(type === 'calculator-open'){
      openNewTab(`https://www.google.com/search?q=calculator`);
    }
    if(type === 'instagram-open'){
      openNewTab(`https://www.instagram.com/`,);
    }
    if(type === 'facebook-open'){
      openNewTab(`https://www.facebook.com/`);
    }
    if(type === 'whatsapp-open'){
      openNewTab(`https://www.whatsapp.com/`);
    }
    if(type === 'weather-show'){
      openNewTab(`https://www.google.com/search?q=weather`);
    }
    if(type === 'youtube-search' || type === 'youtube-play'){
      const query = encodeURIComponent(userInput);
      openNewTab(`https://www.youtube.com/results?search_query=${query}`);
    }

  }

  useEffect(()=>{
    if (!userData) return
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.")
      return
    }
    const recognition=new SpeechRecognition()
    recognition.continuous=true,
    recognition.lang="en-IN"
    recognitionRef.current=recognition;

    let isMounted = true;
    let initialGreetingSpoken = false; 

    const performInitialGreeting = () => {
        if (!initialGreetingSpoken) {
            const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
            greeting.lang = 'hi-IN'; 
          
            greeting.onend = () => {
              initialGreetingSpoken = true;
              startRecognition(); 
            };
            
            if (window.speechSynthesis.getVoices().length > 0) {
              window.speechSynthesis.speak(greeting);
            } else {
              window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.speak(greeting);
              };
            }
        }
    };
    
    recognition.onstart = ()=> {
      isRecognizingRef.current = true;
      setListening(true);
      console.log("Recognition started");
    };
    recognition.onend = ()=> {
      isRecognizingRef.current = false;
      setListening(false);
      if (!micDisabledRef.current) {
        setTimeout(startRecognition, 800)
      }
      console.log("Recognition ended");
    };
    recognition.onerror = (event)=> {
      isRecognizingRef.current = false;
      setListening(false);
      if(event.error !== "aborted" ){
        console.error("Recognition error:", event.error);
      }
    };

    recognition.onresult= async(e)=>{
      const transcript=e.results[e.results.length-1][0].transcript.trim()
      const lowerTranscript = transcript.toLowerCase();
      const assistantName = userData.assistantName.toLowerCase();
      if(lowerTranscript.includes(assistantName) || lowerTranscript.length > 0){
        const cleanCommand = lowerTranscript.replace(assistantName, "").trim();
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current=false
        setListening(false)
        console.log("Command received:", transcript);
        const data = await getGeminiResponse(cleanCommand || transcript);

        if (!data || !data.response) {
           setTimeout(() => startRecognition(), 800);
           return; 
        }

        setAiText(data.response);
        handleCommand(data);

        setUserText("")
      }
    };
    
    performInitialGreeting();
    
    
    const fallback=setInterval(()=>{
      if(!isSpeakingRef.current && !isRecognizingRef.current && isMounted){
        startRecognition();
      }
    },5000)
    
    return()=>{
      isMounted=false;
      
      clearInterval(fallback);
      try { 
          recognitionRef.current.stop();
          synth.cancel();
      } catch (e) {
          // Ignore errors during cleanup
      }
      setListening(false);
      isRecognizingRef.current=false;
     };
    },[userData, getGeminiResponse, serverUrl, navigate]);
  return (
    <div  className='w-full h-[100vh] bg-[#000000] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>

      <ImMenu2 className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)} />
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "-translate-x-full"} transition-transform`}>
      <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer' onClick={()=>setHam(false)} />
     <button onClick={handleLogOut} className='w-[50px] h-[50px] flex cursor-pointer '>
       <ImExit size={26} className='text-white' />
     </button>

      <div onClick={()=>navigate("/customize")}className='flex flex-col items-center cursor-pointer'>
       <RxAvatar className='w-[50px] h-[50px] text-white'/>
       <span className='text-purple-400 text-[14px] mt-[4px] '>
         <b>Edit Me</b></span>
      </div>

      <div className='w-full h-[2px] bg-gray-400'></div>
      <h1 className='text-white font-semibold text-[19px]'>History</h1>
      <div className='w-full h-[400px] gap-[20px] overflow-auto flex flex-col'>
        {userData.history?.map((his, index)=>(
          <span key={index} className='text-white text-[18px] truncate'>{his}</span>
        ))}
      </div>
      </div>
     <button onClick={handleLogOut} className='absolute hidden lg:flex top-[20px] right-[20px] w-[50px] h-[50px] cursor-pointer hover:scale-110 transition'>
       <ImExit size={26} className='text-white' />
     </button>
      <div onClick={()=>navigate("/customize")}className='absolute top-[20px] left-[20px] hidden lg:flex flex-col items-center cursor-pointer'>
        <RxAvatar className='w-[50px] h-[50px] text-white'/>
        <span className='text-purple-400 text-[14px] mt-[4px]'>
        <b>Edit Me</b></span>
      </div>

      
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-3xl shadow-lg'>
       <img src={userData?.assistantImage} alt="assistant" className='h-full object-cover'/> 
      </div>
      <h1 className='text-white text-[20px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
      <button
        onClick={toggleMic}
        className={`mt-3 px-6 py-2 rounded-full text-white font-semibold transition
        ${micOn ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
      >
        {micOn ? "🎤 Mic ON" : "🔇 Mic OFF"}
      </button>
    </div>
  )
}

export default Home