require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use(cors());
app.use(bodyParser.json());
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "developer.ashiq121@gmail.com",
        pass: "exlk yvie iipr zxob"
    }
});

// const otpStore = {};
// app.post('/send-otp', async (req, res) => {
//     try {
//         const { email } = req.body;
//         if (!email) {
//             return res.status(400).json({ message: 'Email is required' });
//         }
//         // const otp = Math.floor(1000 + Math.random() * 9000);
//         // otpStore[email] = otp;

//         const otp = Math.floor(1000 + Math.random() * 9000).toString();
//         otpStore[email] = otp;
//         const mailOptions = {
//             from: "developer.ashiq121@gmail.com",
//             to: email,
//             subject: 'Your OTP Code for Verification',
//             text: `Your OTP code is: ${otp}`
//         };
//         await transporter.sendMail(mailOptions);
//         console.log('OTP sent to email:', email);
//         return res.status(200).json({ otp, message: 'OTP sent to your email' });
//     } catch (err) {
//         console.error('Error sending OTP:', err);
//         return res.status(500).json({ message: 'Error sending OTP', error: err.message });
//     }
// });

app.post('/submit-profile', upload.single('profileImage'), (req, res) => {
    const { name, gender } = req.body;
    const profileImage = req.file;

    if (!name || !gender || !profileImage) {
        return res.status(400).json({ message: 'Name, gender, and profile image are required' });
    }
    const imageUrl = `http://localhost:3000/uploads/${profileImage.filename}`;
    console.log(`Profile Submitted: Name - ${name}, Gender - ${gender}, Image - ${profileImage.originalname}`);
    res.status(200).json({ message: 'Profile submitted successfully', imageUrl });
});

// app.post('/verify-otp', (req, res) => {
//     const { email, otp } = req.body;
//     if (!email || !otp) {
//         return res.status(400).json({ message: 'Email and OTP are required' });
//     }
//     const storedOtp = otpStore[email];
//     if (storedOtp === otp) {
//         delete otpStore[email];
//         return res.status(200).json({ message: 'OTP verified successfully' });
//     } else {
//         return res.status(401).json({ message: 'Invalid OTP' });
//     }
// });


// app.post('/submit-profile', (req, res) => {
//     const { name, gender } = req.body;
//     if (!name || !gender) {
//         return res.status(400).json({ message: 'Name and gender are required' });
//     }
//     console.log(`Profile Submitted: Name - ${name}, Gender - ${gender}`);
//     res.status(200).json({ message: 'Profile submitted successfully' });
// });

const otpStore = {};
app.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 30000
        };
        const mailOptions = {
            from: "developer.ashiq121@gmail.com",
            to: email,
            subject: 'Your OTP Code for Verification',
            text: `Your OTP code is: ${otp} (valid for 30 seconds)`
        };
        await transporter.sendMail(mailOptions);
        console.log('OTP sent to email:', email);
        return res.status(200).json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        return res.status(500).json({ message: 'Error sending OTP', error: err.message });
    }
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedData = otpStore[email];
    if (!storedData) {
        return res.status(400).json({ message: 'No OTP sent to this email' });
    }

    const { otp: storedOtp, expiresAt } = storedData;

    if (Date.now() > expiresAt) {
        delete otpStore[email];
        return res.status(401).json({ message: 'Your OTP has expired. Please request a new one to proceed.' });
    }

    if (storedOtp !== otp) {
        return res.status(401).json({ message: 'Invalid OTP' });
    }
    delete otpStore[email];
    return res.status(200).json({ message: 'OTP verified successfully' });
});


app.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 60000
        };
        const mailOptions = {
            from: "developer.ashiq121@gmail.com",
            to: email,
            subject: 'Your OTP Code (Resent)',
            text: `Your new OTP code is: ${otp} (valid for 10 seconds)`
        };
        await transporter.sendMail(mailOptions);
        console.log('Resent OTP to email:', email);

        return res.status(200).json({ message: 'OTP resent to your email' });
    } catch (err) {
        console.error('Error resending OTP:', err);
        return res.status(500).json({ message: 'Error resending OTP', error: err.message });
    }
});


// app.post('/emergency', async (req, res) => {
//     try {
//         const { address, message } = req.body;
//         if (!address || !message) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'developer.ashiq121@gmail.com',
//                 pass: 'exlk yvie iipr zxob'
//             }
//         });

//         const mailOptions = {
//             from: 'developer.ashiq121@gmail.com',
//             to: 'jyoti.farswan@ens.enterprises',
//             subject: '🚨 Emergency Help at this Location',
//             html: `
//               <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
//                 <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
//                   <h2 style="color: #dc2626;">🚨 Emergency Alert</h2>
//                   <p style="font-size: 16px; color: #111827;">
//                     <strong style="color: #dc2626;">Message:</strong> ${message}
//                   </p>
//                   <p style="font-size: 16px; color: #111827;">
//                     <strong>📍 Location:</strong> ${address}
//                   </p>
//                   <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
//                     Please take immediate action if necessary.
//                   </p>
//                 </div>
//               </div>
//             `
//         };

//         const info = transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 return console.log('Error while sending email:', error);
//             }
//             console.log('Email sent:', info.response);
//         });
//         res.status(201).json({ message: 'Contact form submitted successfully', data: req.body });
//     } catch (err) {
//         res.status(500).json({ message: 'Error submitting contact form', error: err.message });
//     }
// });

app.post('/emergency', async (req, res) => {
    try {
        const { address, message, email } = req.body;
        if (!address || !message || !email) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'developer.ashiq121@gmail.com',
                pass: 'exlk yvie iipr zxob'
            }
        });
        const mailOptions = {
            from: 'developer.ashiq121@gmail.com',
            to: email,
            subject: '🚨 Emergency Help at this Location',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #dc2626;">🚨 Emergency Alert</h2>
                  <p style="font-size: 16px; color: #111827;">
                    <strong style="color: #dc2626;">Message:</strong> ${message}
                  </p>
                  <p style="font-size: 16px; color: #111827;">
                    <strong>📍 Location:</strong> <a href="https://www.google.com/maps?q=${encodeURIComponent(address)}" target="_blank" style="color: #1e40af;">${address}</a>
                  </p>
                  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Please take immediate action if necessary. You can view the exact location on Google Maps using the link above.
                  </p>
                </div>
              </div>
            `
        };
        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Contact form submitted successfully', data: req.body });
    } catch (err) {
        res.status(500).json({ message: 'Error submitting contact form', error: err.message });
    }
});

app.post('/invite', (req, res) => {
    const { email, location } = req.body;
    if (!email || !location) {
        return res.status(400).json({ message: 'Email and location are required.' });
    }
    console.log(`Invite sent to ${email} with location: ${location}`);
    return res.status(200).json({ message: `Invitation sent to ${email} with location: ${location}` });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
