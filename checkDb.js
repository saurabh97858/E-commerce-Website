const mongoose = require('mongoose');
const Product = require('./backend/models/Product');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const products = await Product.find({}, 'name images');
        for (const p of products) {
            console.log(`Product: ${p.name}, Images:`, p.images.map(i => i.substring(0, 50) + '...'));
        }
        mongoose.disconnect();
    })
    .catch(console.error);
