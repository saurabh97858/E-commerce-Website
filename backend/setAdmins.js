const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updateAllToAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany({}, { $set: { role: 'admin' } });
        console.log(`Successfully updated ${result.modifiedCount} users to admin role.`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error.message);
        process.exit(1);
    }
};

updateAllToAdmin();
