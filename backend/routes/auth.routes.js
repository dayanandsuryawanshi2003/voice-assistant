import express from "express"
import {Login, logOut, signUp, googleSignIn } from "../controllers/auth.controllers.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",Login)
authRouter.post("/google-signin", googleSignIn)
authRouter.post("/logout",logOut)


export default authRouter


