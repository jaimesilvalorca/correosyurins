import { Router } from "express";
import UserModel from "../dao/models/user.model.js";
import productModel from "../dao/models/products.models.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport"
import dotenv from 'dotenv'

dotenv.config()


const router = Router()

router.get('/register', (req, res) => {
    res.render('sessions/register')
})

router.get('/github/login',passport.authenticate('github',{scope:['user:email']}),(req,res)=>{})

router.get('/githubcallback', passport.authenticate('github',{failureRedirect:'/session/login'}),
async(req,res)=>{
    if (!req.user) {
        return res.status(400).send({ status: 'error', error: 'Invalid credentials'})
    }
    res.cookie(process.env.JWT_COOKIE_NAME,req.user.token).redirect('/api/products/view')
}
)

router.post('/register',
    passport.authenticate('register', { failureRedirect: '/session/failureRegister' }),
    async (req, res) => {
        res.redirect('/session/login')
    })

router.get('/failureRegister', (req, res) => {
    res.send({ error: 'failed' })
})

router.get('/login', (req, res) => {
    res.render('sessions/login')
})

router.post('/login', 
    passport.authenticate('login', {failureRedirect: '/session/failLogin'}),
    async (req, res) => {
    
    if (!req.user) {
        return res.status(400).send({ status: 'error', error: 'Invalid credentials'})
    }

    // req.session.user = {
    //     first_name: req.user.first_name,
    //     last_name: req.user.last_name,
    //     email: req.user.email,
    //     age: req.user.age
    // }
    res.cookie(process.env.JWT_COOKIE_NAME,req.user.token).redirect('/products')
})

router.get('/failLogin', (req, res) => {
    res.send({ error: 'Fail in login' })
})

router.get('/logout', (req, res) => {
    // req.session.destroy(err => {
    //     if (err) {
    //         res.status(500).render('errors/base')
    //     } else {
    //         res.redirect('/session/login')
    //     }
    // })
    res.clearCookie(process.env.JWT_COOKIE_NAME).redirect('/session/login')
})

router.get('/current',(req,res)=>{
    res.send('')
})


export default router