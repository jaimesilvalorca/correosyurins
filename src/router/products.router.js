import { Router } from 'express'
import productModel from '../dao/models/products.models.js'
// const {Router} = require('express')
// const fs = require ('fs')
// import fs from 'fs'
// const filename = './productManager.json'

const router = Router()

router.get("/", async (req, res) => {
    const products = await productModel.find().lean().exec()
    const limit = req.query.limit || 5
    
    res.json(products.slice(0, parseInt(limit)))
    
})


router.get("/view", async (req, res) => {
    const products = await productModel.find().lean().exec()
    res.render('realTimeProducts', {
        data: products
    })
})

router.get("/:id", async (req, res) => {
    const id = req.params.id
    const product = await productModel.findOne({_id: id})
    res.json({
        product
    })
})

router.delete("/:pid", async (req, res) => {
    const id = req.params.pid
    const productDeleted = await productModel.deleteOne({_id: id})

    req.io.emit('updatedProducts', await productModel.find().lean().exec());
    res.json({
        status: "Success",
        massage: "Producto eliminado",
        productDeleted
    })
})

router.post("/", async (req, res) => {
    try {
        const product = req.body
        if (!product.title) {
            return res.status(400).json({
                message: "Error no se ingresó el nombre"
            })
        }
        const productAdded = await productModel.create(product)
        req.io.emit('updatedProducts', await productModel.find().lean().exec());
        res.json({
            status: "Producto agregado",
            productAdded
        })
    } catch (error) {
        console.log(error)
        res.json({
            error
        })
    }
})

router.put("/:pid", async (req, res) => {
    const id = req.params.pid
    const productToUpdate = req.body

    const product = await productModel.updateOne({
        _id: id
    }, productToUpdate)
    req.io.emit('updatedProducts', await productModel.find().lean().exec());
    res.json({
        status: "Producto actualizado",
        product
    })
})






// router.get ('/',(request,response)=>{
//     const content = fs.readFileSync(filename,'utf-8')
//     const products = JSON.parse(content)
//     const limit = request.query.limit
//     if(limit){
//         const result = products.slice(0, limit)
//         const count = result.length
//         if(count > 0){
//             response.json({result})
//         }else if(count === 0){
//             response.send('Numero de limite invalido')

//         }     
//     }else{
//         response.send({products})
//     }
// })

// router.get('/:pid',(request,response)=>{
//     const content = fs.readFileSync(filename,'utf-8')
//     const products = JSON.parse(content)
//     const pid = request.query.pid
//     if(pid){
//         const result = products.find(item =>item.id == pid)
//         response.send({result})
//     }else{
//         response.send('No se encontró el ID seleccionado')
//     }
// })

// router.get('/',(req,res)=>{
//     const content = fs.readFileSync(filename,'utf-8')
//     const products = JSON.parse(content)
//     res.render('home',products)
// })


export default router

