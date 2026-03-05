const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'cat_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', getCategories);
router.post('/', auth, admin, upload.single('image'), createCategory);
router.put('/:id', auth, admin, upload.single('image'), updateCategory);
router.delete('/:id', auth, admin, deleteCategory);

module.exports = router;
