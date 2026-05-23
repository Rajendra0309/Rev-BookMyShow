const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
    const serviceAccountKeyEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKeyEnv) {
        const serviceAccount = JSON.parse(serviceAccountKeyEnv);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized from environment variable.');
    } else {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/firebase-service-account.json';
        const fs = require('fs');
        const path = require('path');
        const resolvedPath = path.resolve(__dirname, '..', serviceAccountPath);
        if (fs.existsSync(resolvedPath)) {
            const serviceAccount = require(resolvedPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log(`Firebase Admin SDK initialized from file: ${resolvedPath}`);
        } else {
            console.warn('Firebase Admin SDK: Service account key not found. Social login will fail until key is configured.');
        }
    }
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
}

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
    try {
        const { name, email, password, role, securityQuestion, securityAnswer } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const hashedAnswer = securityAnswer
            ? await bcrypt.hash(securityAnswer.toLowerCase(), salt)
            : undefined;

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Customer',
            securityQuestion,
            securityAnswer: hashedAnswer
        });

        res.status(201).json({
            msg: 'User registered successfully',
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        if (user.status === 'Inactive') {
            return res.status(403).json({ msg: 'Account is deactivated' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        res.status(200).json({
            msg: 'Login successful',
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -securityAnswer');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -securityAnswer');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this email' });
        }

        if (!user.securityAnswer) {
            return res.status(404).json({ msg: 'No security question set for this account' });
        }

        const isMatch = await bcrypt.compare(
            securityAnswer.toLowerCase(),
            user.securityAnswer
        );
        if (!isMatch) {
            return res.status(400).json({ msg: 'Security answer is incorrect ' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ msg: 'Password reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getSecurityQuestion = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email }).select('securityQuestion');
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this email' });
        }
        res.status(200).json({ securityQuestion: user.securityQuestion });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const socialLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ msg: 'Firebase ID token is required' });
        }

        // Verify Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, uid, firebase } = decodedToken;
        const provider = firebase.sign_in_provider === 'google.com' ? 'google' : 'microsoft';

        // Find or create user in MongoDB
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                role: 'Customer',
                authProvider: provider,
                googleId: provider === 'google' ? uid : undefined,
                microsoftId: provider === 'microsoft' ? uid : undefined,
                status: 'Active'
            });
        } else {
            let updated = false;
            if (provider === 'google' && !user.googleId) {
                user.googleId = uid;
                user.authProvider = 'google';
                updated = true;
            } else if (provider === 'microsoft' && !user.microsoftId) {
                user.microsoftId = uid;
                user.authProvider = 'microsoft';
                updated = true;
            }

            if (user.status === 'Inactive') {
                return res.status(403).json({ msg: 'Account is deactivated' });
            }

            if (updated) {
                await user.save();
            }
        }

        res.status(200).json({
            msg: 'Social login successful',
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Social login token verification error:', err.message);
        res.status(401).json({ msg: 'Invalid or expired authorization token' });
    }
};

module.exports = { 
    register, 
    login, 
    socialLogin, 
    getProfile, 
    getAllUsers, 
    changePassword, 
    forgotPassword, 
    getSecurityQuestion 
};