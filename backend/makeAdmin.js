// Script to create an admin user or make an existing user admin
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if any user exists
        const users = await User.find();

        if (users.length === 0) {
            // Create a new admin user
            const admin = await User.create({
                name: 'Admin',
                surname: 'User',
                email: 'admin@shoes.com',
                password: 'admin123',
                address: 'Admin Office',
                city: 'Delhi',
                pincode: '110001',
                gender: 'Male',
                mobile: '9999999999',
                role: 'admin'
            });
            console.log('✅ Admin user created!');
            console.log('   Email: admin@shoes.com');
            console.log('   Password: admin123');
        } else {
            // Make the first user admin
            const firstUser = users[0];
            firstUser.role = 'admin';
            await User.updateOne({ _id: firstUser._id }, { $set: { role: 'admin' } });
            console.log(`✅ User "${firstUser.name} ${firstUser.surname}" (${firstUser.email}) is now ADMIN!`);
            console.log('   Login with your same email and password.');
        }

        await mongoose.disconnect();
        console.log('\nDone! Now login on http://localhost:5174 to access Admin Panel.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

makeAdmin();
