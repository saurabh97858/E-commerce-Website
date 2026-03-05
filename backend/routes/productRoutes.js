const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', auth, admin, upload.array('images', 5), createProduct);
router.put('/:id', auth, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;
