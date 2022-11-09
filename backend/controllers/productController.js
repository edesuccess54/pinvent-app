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

module.exports = {
    createProduct,
    getProducts
}