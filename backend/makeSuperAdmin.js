// Script to create a super admin user or make an existing user super_admin
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if any user exists
        const users = await User.find();

        if (users.length === 0) {
            // Create a new super admin user
            const admin = await User.create({
                name: 'Super',
                surname: 'Admin',
                email: 'superadmin@shoes.com',
                password: 'superadmin123',
                address: 'HQ Office',
                city: 'Delhi',
                pincode: '110001',
                gender: 'Male',
                mobile: '8888888888',
                role: 'super_admin'
            });
            console.log('✅ Super Admin user created!');
            console.log('   Email: superadmin@shoes.com');
            console.log('   Password: superadmin123');
        } else {
            // Make the first user super admin
            const firstUser = users[0];
            firstUser.role = 'super_admin';
            await User.updateOne({ _id: firstUser._id }, { $set: { role: 'super_admin' } });
            console.log(`✅ User "${firstUser.name} ${firstUser.surname}" (${firstUser.email}) is now SUPER ADMIN!`);
            console.log('   Login with your same email and password to access Manage Admins.');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

makeSuperAdmin();
