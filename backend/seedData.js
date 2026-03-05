// Seed script - adds sample categories and products to the database
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const categories = [
    { name: 'GENTSWEAR', description: 'Shoes for gentlemen' },
    { name: 'LADIESWEAR', description: 'Shoes for ladies' },
    { name: 'MENSWEAR', description: 'Casual and sports shoes for men' },
    { name: 'CHILDRENWEAR', description: 'Shoes for children' },
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Category.deleteMany();
        await Product.deleteMany();
        console.log('Cleared old data');

        // Create categories
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ ${createdCategories.length} categories added`);

        const gents = createdCategories[0]._id;
        const ladies = createdCategories[1]._id;
        const mens = createdCategories[2]._id;
        const children = createdCategories[3]._id;

        // Create products (using placeholder images since we don't have real uploads)
        const products = [
            { name: 'GUJARATI MOJARIS', price: 600, description: 'Traditional Gujarati mojari shoes, handcrafted with premium leather and intricate embroidery.', category: gents, stock: 25, sizes: ['6', '7', '8', '9', '10'], images: [] },
            { name: 'FORMAL SHOES', price: 300, description: 'Classic formal shoes for office and parties. Made with genuine leather.', category: gents, stock: 40, sizes: ['7', '8', '9', '10', '11'], images: [] },
            { name: 'CAN SHOES', price: 1500, description: 'Premium canvas shoes for everyday comfort and style.', category: mens, stock: 30, sizes: ['6', '7', '8', '9', '10'], images: [] },
            { name: 'FORM SHOES', price: 1400, description: 'Heavy duty form shoes with ankle support and durable sole.', category: mens, stock: 20, sizes: ['7', '8', '9', '10'], images: [] },
            { name: 'CHILD1 SHOES', price: 200, description: 'Colorful and comfortable shoes for little kids. Soft sole for growing feet.', category: children, stock: 50, sizes: ['1', '2', '3', '4', '5'], images: [] },
            { name: 'CHILD2 SHOES', price: 400, description: 'Sports shoes for active children. Lightweight and breathable.', category: children, stock: 35, sizes: ['2', '3', '4', '5', '6'], images: [] },
            { name: 'CHILD SHOES', price: 800, description: 'Premium quality school shoes for children. Durable and comfortable.', category: children, stock: 45, sizes: ['3', '4', '5', '6'], images: [] },
            { name: 'CANVAS SHOES', price: 552, description: 'Trendy canvas shoes with rubber sole. Perfect for casual outings.', category: mens, stock: 60, sizes: ['6', '7', '8', '9', '10', '11'], images: [] },
            { name: 'CAN52 SHOES', price: 650, description: 'Updated canvas design with extra cushioning and arch support.', category: mens, stock: 28, sizes: ['7', '8', '9', '10'], images: [] },
            { name: 'LADIES HEELS', price: 900, description: 'Elegant high heels for women. Perfect for parties and formal occasions.', category: ladies, stock: 30, sizes: ['4', '5', '6', '7', '8'], images: [] },
            { name: 'LADIES SANDALS', price: 450, description: 'Comfortable daily wear sandals for women. Soft padded sole.', category: ladies, stock: 55, sizes: ['4', '5', '6', '7', '8'], images: [] },
            { name: 'LADIES SPORTS', price: 1200, description: 'Lightweight sports shoes for women. Ideal for running and gym.', category: ladies, stock: 25, sizes: ['5', '6', '7', '8'], images: [] },
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} products added`);

        await mongoose.disconnect();
        console.log('\n🎉 Database seeded successfully!');
        console.log('Open http://localhost:5174 to see products on the homepage.');
        console.log('\nNote: Products have no images yet. Login as admin and edit products to upload images.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedData();
