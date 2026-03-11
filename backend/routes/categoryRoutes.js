const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const fs = require('fs');

const getUploadDir = () => {
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const dir = isVercel ? '/tmp/uploads/' : 'uploads/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, getUploadDir()),
    filename: (req, file, cb) => cb(null, 'cat_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/', getCategories);
router.post('/', auth, admin, upload.single('image'), createCategory);
router.put('/:id', auth, admin, upload.single('image'), updateCategory);
router.delete('/:id', auth, admin, deleteCategory);

module.exports = router;
