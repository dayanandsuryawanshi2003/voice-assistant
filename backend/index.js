import dotenv from "dotenv"
dotenv.config()
import express from "express"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import session from "express-session"
import passport from "passport"
import "./config/passport.js"

const app=express();
const port=process.env.PORT || 5000;
app.use(cors({
    origin: "voice-assistant-fawn-three.vercel.app",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

//  Session 
app.use(session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie:{ secure: false, path:'/'}
}));
// 🔹 Passport middleware
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})


app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)


connectDb()
    .then(() => {
        console.log("Database connected successfully");
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });

