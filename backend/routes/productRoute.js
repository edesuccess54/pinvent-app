const express = require('express');
const { createProduct, getProducts, getProduct } = require('../controllers/productController');
const protect = require('../middleWare/authMiddleWare');
const { upload } = require('../utils/fileUpload');
upload

const router = express.Router();


router.post('/', protect, upload.single("image"), createProduct)
router.get('/', protect, getProducts)
router.get('/:id', protect, getProduct)



module.exports = router