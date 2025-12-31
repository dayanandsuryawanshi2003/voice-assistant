import dotenv from "dotenv";
dotenv.config()
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/user.model.js" 

console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID)
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET)
console.log("Google Callback URL:", process.env.GOOGLE_CALLBACK_URL)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async  (accessToken, refreshToken, profile, done) => {
     try {
        // DB मध्ये user शोधा
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})
    