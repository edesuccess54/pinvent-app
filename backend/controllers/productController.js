const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const {fileSzeFormater} = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;


const createProduct = asyncHandler (async (req, res) => {
    const {name, sku, category, quantity, price, description} = req.body

    // validation
    if(!name || !sku || !category || !quantity || !price || !description) {
        res.status(400)
        throw new Error("Please fill in all fields")
    }

    // Handle image upload 
    let fileData = {}
    if(req.file) {
        // save image to cloudinary
        let uploadedFile
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder:"pinvent-app", resource_type:"image"})
        } catch (error) {
            res.status(500)
            throw new Error("image could not be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSzeFormater(req.file.size, 2),
        }
    }
 
    // create product 
    const product = await Product.create({
        user: req.user.id,
        name, 
        sku, 
        category, 
        quantity, 
        price, 
        description,
        image: fileData
    })
    res.status(201).json(product)
})


// get all products
const getProducts = asyncHandler (async (req, res) => {
    const products = await Product.find({user: req.user.id}).sort("-createdAt")
    res.status(200).json(products)
})

// get single product 
const getProduct = asyncHandler (async (req, res) => {

    const { id } = req.params
    const product = await Product.findById(id)

    if(!product) {
        res.status(404)
        throw new Error("product not found")
    }

    if(product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("user not authorized")
    }

    res.status(200).json(product)
})

// delete product 
const deleteProduct = asyncHandler (async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)

    if(!product) {
        res.status(404)
        throw new Error("product not found")
    }

    if(product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("user not authorized to delete product")
    }

    await product.remove()
    res.status(200).json({message: "product deleted"})
  
})

// update product 
const updateProduct = asyncHandler ( async(req, res) => {
    const { id } = req.params
    const {name, category, quantity, price, description} = req.body

    const product = await Product.findById(id)

    if(!product) {
        res.status(404)
        throw new Error("product not found")
    }

    if(product.user.toString() !== req.user.id) {
        res.status(401)
        throw new Error("user not authorized to update product")
    }

    // Handle image upload 
    let fileData = {}
    if(req.file) {
        // save image to cloudinary
        let uploadedFile
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder:"pinvent-app", resource_type:"image"})
        } catch (error) {
            res.status(500)
            throw new Error("image could not be uploaded")
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSzeFormater(req.file.size, 2),
        }
    }
 
    // update product 
    const updateProduct = await Product.findByIdAndUpdate({_id: id}, 
            {
                name, 
                category, 
                quantity, 
                price, 
                description,
                image: Object.keys(fileData).length === 0 ? product.image : fileData
            },
            {
                new: true,
                runValidators: true
            }
        )
        
    res.status(200).json(updateProduct)
})

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct
}