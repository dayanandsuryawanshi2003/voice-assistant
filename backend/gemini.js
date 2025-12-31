import axios from "axios"

const geminiResponse=async (command, assistantName, userName)=>{
    try{
        const apiKey=process.env.GEMINI_API_KEY;
        const apiUrl=process.env.GEMINI_API_URL;
        const cleanCommand = command
         .toLowerCase()
         .replace(assistantName.toLowerCase(), "")
         .trim();

        const systemPrompt = `You are virtual assistant named ${assistantName}, created by ${userName}.You are not Google Assistant. You respond only in JSON format like this:
        {
            "type":"general" | "google-search"|"youtube-search"|"youtube-play" |"get-day"|"get-time"|"get-date"|"get-month"|
                   "calculator-open"|"instagram-open"|"whatsapp-open"|"facebook-open"|"weather-show",
            "userInput": "${cleanCommand}",
            "response": "<short spoken reply>"
        } 
        Instructions:
        -"type": determine the intent of the user.
        -"userInput: original sentence the user spoke.
        -"response": A short voice-friendly reply ,e.g.,"Sure,playing it now", "Here's what i found","today is tuesday,etc.
        Type meanings:
        -"general": if it's a factual or informational question.If you know the answer of any question then put it in general type and gives short answer.
        -"google-search": if user wants to search something on Google.
        -"youtube-search": if user wants to search something on youtube.
        -"youtube-play": if user wants to directly play a video or song .
        -"calculator-open":if user wants to open calculator.
        -"whatsapp-open": if user wants to open whatsapp.
        -"instagram-open": if user wants to open instagram.
        -"facebook-open": if user wants to open facebook.
        -"get-time": if user want to know the time.
        -"get-date": if user want to know date.
        -"weather-show": if user want to know weather.
        -Important:
        -Use ${userName} if someone asks about who created you.
        -Only respond only with the JSON object, nothing else.
        now your user input: "${cleanCommand}"`;
       

        const result=await axios.post(apiUrl,{
           contents: [
            {
              parts: [{text: systemPrompt }]
            }],
          },{headers:{
            "Content-Type": "application/json",
            "x-goog-api-key":process.env.GEMINI_API_KEY,
          },

          }
        );

        const rawText = result.data.candidates[0].content.parts[0].text;

       const match = rawText.match(/\{[\s\S]*\}/);
        
        if (match) {
            return JSON.parse(match[0]);
        } else {
            throw new Error("No JSON found");
        }

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return { 
        type: "general", 
        response: "I'm sorry, I'm having trouble connecting to my brain right now." 
    };
  } 
    
           
    
};

export default geminiResponse


