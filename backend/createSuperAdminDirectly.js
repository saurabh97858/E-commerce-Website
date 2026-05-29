const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createSuperAdminDirectly = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('superadmin123', salt);

        await User.findOneAndUpdate(
            { email: 'superadmin@shoes.com' },
            {
                $set: {
                    name: 'Super',
                    surname: 'Admin',
                    email: 'superadmin@shoes.com',
                    password: hashedPassword,
                    address: 'HQ',
                    city: 'Delhi',
                    pincode: '110001',
                    gender: 'Male',
                    mobile: '9999999999',
                    role: 'super_admin'
                }
            },
            { upsert: true, new: true }
        );
        console.log('Successfully created superadmin@shoes.com / superadmin123');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createSuperAdminDirectly();
