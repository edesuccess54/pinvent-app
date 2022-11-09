const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const fileSzeFormater = require("../utils/fileUpload");


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
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
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

    console.log(product)

    res.status(201).json(product)
})



module.exports = {
    createProduct
}