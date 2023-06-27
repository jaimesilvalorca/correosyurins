import { Router } from 'express'
import cartModel from "../dao/models/carts.models.js"
// const { Router } = require('express')
// const fs = require ('fs')
// import fs from 'fs'

// const filename = './productManager.json'
const router = Router()

router.get("/", async (req, res) => {
    const carts = await cartModel.find().lean().exec()
    res.json({ carts })
})


router.get("/:id", async (req, res) => {
    const id = req.params.id
    const cart = await cartModel.findOne({_id: id})
    res.json({ cart })
})

router.post("/", async (req, res) => {
    const newCart = await cartModel.create({})
    res.json({status: "Success", newCart})
})


router.post("/:cid/product/:pid", async (req, res) => {
    const cartID = req.params.cid
    const productID = req.params.pid
    const quantity= req.body.quantity || 1
    const cart = await cartModel.findById(cartID)

    let found = false
    for (let i = 0; i < cart.products.length; i++) {
        if (cart.products[i].id == productID) {
            cart.products[i].quantity++
            found = true
            break
        }
    }
    if (found == false) {
        cart.products.push({ id: productID, quantity})
    }

    await cart.save()


    res.json({status: "Carrito Actualizado!", cart})
})

router.delete("/:cid/product/:pid", async (req, res) => {
    const cartID = req.params.cid
    const productID = req.params.pid

    const cart = await cartModel.findById(cartID)
    if(!cart) return res.status(404).json({status: "error", error: "Cart Not Found"})

    const productIDX = cart.products.findIndex(p => p.id == productID)
    
    if (productIDX <= 0) return res.status(404).json({status: "error", error: "Product Not Found on Cart"})

    cart.products = cart.products.splice(productIDX, 1)
    await cart.save()
    
    res.json({status: "Success", cart})
})


export default router









// router.post('/', (req,res) =>{
//     const cart = {title:"producto prueba 4", description:"nuevo producto prueba 4", price:"Profe awesome10", thumbnail:"sin imagen",code:"123123123", stock:"111"}
//     const content = fs.readFileSync(filename,'utf-8')
//     const cartJ = JSON.parse(content)
//     cartJ.push(cart)
//     res.status(201).send('OK!')})

// router.put('/',(req,res)=>{
//     const cart = req.body
//     const content = fs.readFileSync(filename,'utf-8')
//     const cartJ = JSON.parse(content)
//     cartJ = cartJ.filter(item => item.id === id)
//     cartJ.push(cart)

// })

// router.delete('/:id',(req,res)=>{
//     const id = req.params.id
//     const content = fs.readFileSync(filename,'uft-8')
//     const cartJ = JSON.parse(content)
//     cartJ = cartJ.filter(item => item.id === id)
//     res.send(cartJ)
// })

// router.post('/',(req,res)=>{
//     const newProduct = req.body
//     const content = fs.readFileSync(filename,'utf-8')
//     const cartJ = JSON.parse(content)
//     cartJ.push(newProduct)
//     res.status(201).send('Ok!!!')
//     fs.writeFileSync(filename,JSON.stringify(cartJ,null,'\t'))
// })