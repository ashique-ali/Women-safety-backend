const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    emergencyNo: String,
    emergencyEmail: String,
    pincode: String,
}, { timestamps: true });

// Login Schema
const loginSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    password: { type: String, required: true },
});

// Forgot Schema
const forgotchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
});

// Incident Report Schema
const IncidentReportSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pincode: String,
    report: String,
    address: String,
    createdAt: { type: Date, default: Date.now }
});

// contact us Schema

const contactSchema = new mongoose.Schema({
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }
});

// Create models
const User = mongoose.model('User', userSchema);
const Login = mongoose.model('Login', loginSchema);
const Forgot = mongoose.model('Forgot', forgotchema);
const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);
const contact = mongoose.model('contact', contactSchema);

// Export all models
module.exports = {
    User,
    Login,
    Forgot,
    IncidentReport,
    contact
};
