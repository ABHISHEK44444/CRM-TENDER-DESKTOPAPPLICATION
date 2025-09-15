const User = require('../models/user');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, role, avatarUrl, department, designation, specializations, password } = req.body;
        const specializationsArray = specializations ? specializations.split(',').map(s => s.trim()).filter(Boolean) : [];
        const newUser = {
            id: `user${Date.now()}`,
            name,
            role,
            avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${name.replace(/\s/g, '+')}&background=random&color=fff&size=40`,
            department,
            designation,
            specializations: specializationsArray,
            password,
            username: name.toLowerCase().replace(/\s/g, ''),
            email: `${name.toLowerCase().replace(/\s/g, '')}@mintergraph.com`
        };
        const user = await User.create(newUser);
        res.status(201).json(user.toJSON());
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        let updateData = { ...req.body };
        if(updateData.specializations && typeof updateData.specializations === 'string') {
             updateData.specializations = updateData.specializations.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        // Don't update password if it's not provided
        if (!updateData.password) {
            delete updateData.password;
        }

        const user = await User.findOne({ id: req.params.id });
        if (!user) {
             return res.status(404).json({ message: 'User not found' });
        }
        
        Object.assign(user, updateData);
        await user.save();
        
        res.status(200).json(user.toJSON());
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
};
