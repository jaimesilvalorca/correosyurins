// const express = require('express')
// const productRouter = require('./router/products.router.js')
// const cartRouter = require('./router/carts.router.js')
// const {Server} = require('socket.io')
// const productViewRouter = require('./router/productsView.js')
// const handlebars = require('express-handlebars')
import express from "express"
import { Server } from "socket.io"
import productRouter from "./router/products.router.js"
import cartRouter from "./router/carts.router.js"
import productViewRouter from "./router/productsView.router.js"
import handlebars from "express-handlebars"
import mongoose from "mongoose"
import chatRouter from "./router/chat.router.js"
import messagesModel from "./dao/models/message.models.js"
import sessionRouter from "./router/session.router.js"
import session from "express-session"
import MongoStore from "connect-mongo"
import passport from "passport"
import initializePassport from "./config/passport.config.js"
import {passportCall} from "./utils.js"
import cookieParser from "cookie-parser"


// const url = 'mongodb+srv://coder:coder@cluster0.cmvdrrk.mongodb.net/ecommerce'
const url = 'mongodb://127.0.0.1:27017/ecommerce'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')
app.use(express.static('./src/public'))
app.get('/', (request, response) => {
    response.send('Desafio 03!')
})

app.use(session({
    // store:MongoStore.create({
    //     mongoUrl:url,
    //     dbName:'ecommerce'    
    // }),
    secret:'jaimesilva',
    resave:true,
    saveUninitialized:true
}))
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.use('/session',sessionRouter)

app.use('/api/products',passportCall('jwt'),productRouter)
app.use('/api/carts', cartRouter)
app.use('/products',passportCall('jwt'),productViewRouter)
app.use('/api/chats',chatRouter)

mongoose.set('strictQuery', false)

try {
    await mongoose.connect(url);
    console.log("DB conected");
    const httpServer = app.listen(8080, () => {
        console.log("Server UP");
        console.log("http://localhost:8080/")
    });

    const socketServer = new Server(httpServer);

    socketServer.on("connection", socket => {
        console.log("New client connected")
        socket.on("message", async data => {
        await messagesModel.create(data)
        let messages = await messagesModel.find().lean().exec()
        socketServer.emit("logs", messages)
        })
    })

} catch (error) {
    console.log(error);
}