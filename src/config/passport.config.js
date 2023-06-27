import passport from "passport";
import local from "passport-local"
import UserModel from "../dao/models/user.model.js";
import { createHash, isValidPassword,generateToken,extractCookie } from "../utils.js";
import GitHubStrategy from 'passport-github2'
import dotenv from 'dotenv'
import passport_jwt, { ExtractJwt } from 'passport-jwt'

dotenv.config()

const LocalStrategy = local.Strategy
const JWTStrategy = passport_jwt.Strategy

const initializePassport = () => {

    passport.use('github',new GitHubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/session/githubcallback'
    },async(accessToken,refreshToken,profile,done)=>{
        console.log(profile)
        try {
            const user = await UserModel.findOne({email:profile._json.email})
            if(user)return done(null,user)
            const newUser = await UserModel.create({
                first_name: profile._json.name,
                email:profile._json.email
            })

            const token = generateToken(user)
            user.token = token

            return done(null,newUser)
            
        } catch (error) {
            return done('Error to login with github'+error)
            
        }
    }))

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async (req, username, password, done) => {
        const { first_name, last_name, age, email } = req.body
        try {
            const user = await UserModel.findOne({ email: username })
            if (user) {
                console.log('User already exist!')
                return done(null, false)
            }
            const newUser = {
                first_name, last_name, age, email,
                password: createHash(password)
            }
            const result = await UserModel.create(newUser)
            return done(null, result)

        } catch (error) {
            return done('error en el passport register' + error)

        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email'

    }, async (username, password, done) => {
        try {
            const user = await UserModel.findOne({ email: username })
            if (!user) {
                console.log('User does not exists')
                return done(null, user)
            }
            if (!isValidPassword(user, password)) return done(null, false)
            console.log("logeado")

            const token = generateToken(user)
            user.token = token

            return done(null, user)

        } catch (error) {
            return done('error')

        }
    }))

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([extractCookie]),
        secretOrKey: process.env.JWT_PRIVATE_KEY 
    },async(jwt_payload,done)=>{
        done(null,jwt_payload)
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        const user = await UserModel.findById(id)
        done(null, user)
    })
}



export default initializePassport