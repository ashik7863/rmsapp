const DB = require('../config');
const nodemailer = require('nodemailer');
const {HashPassword} = require('../Services/Functions');

const dbInstance = new DB();

function sendOtpEmail(toEmail, otp) {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ashikmolla78633@gmail.com',
      pass: 'agnb vlmw vyaq oplr',
    },
  });

  let mailOptions = {
    from: 'ashikmolla78633@gmail.com',
    to: toEmail,
    subject: 'RMS OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">RMS OTP Verification Code</h2>
        <p style="font-size: 16px; color: #555;">
          Dear User,
        </p>
        <p style="font-size: 16px; color: #555;">
          Thank you for choosing RMS. To proceed with the verification process, please use the following One-Time Password (OTP):
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2c3e50; background-color: #ecf0f1; padding: 10px 20px; border-radius: 5px;">${otp}</span>
        </div>
        <p style="font-size: 16px; color: #555;">
          Please note, this OTP is valid for the next 10 minutes. For your security, do not share this code with anyone. If you did not request this OTP, please ignore this email or contact our support team immediately.
        </p>
        <p style="font-size: 16px; color: #555;">
          Thank you for being a valued part of RMS. We are here to assist you if you have any questions or concerns.
        </p>
        <p style="font-size: 16px; color: #555; margin-top: 30px;">
          Best regards,<br>
          <strong>RMS Support Team</strong>
        </p>
      </div>
    `,
  };

  try {
    let info = transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.log('Error sending email: ', error);
  }

  return otp;
}

const Login = async (req, res) => {
    try {
      await dbInstance.connect();
  
      let { email, password } = req.body;

      console.log(req.body)
  
      // Check if both email and password are provided
      if (!email || !password) {
        return res.status(404).json({
          status: 404,
          msg: "Please fill in mandatory fields",
        });
      }
  
      // Hash the password before comparing it to the database value
      let hashedPassword = HashPassword(password);
  
      // Fetch user data from the restaurant table using email and hashed password
      const userdata = await dbInstance.arr(
        `SELECT id, rst_id, owner, restaurant_name 
         FROM restaurant WHERE email=? AND password=?`,
        [email, hashedPassword]
      );
  
      // If userdata exists, return success response
      if (userdata) {
        return res.status(200).json({
          status: 200,
          data: userdata,
          msg: "Logged in successfully",
        });
      } else {
        return res.status(404).json({
          status: 404,
          msg: "Invalid credentials",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };
  
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const ForgotPassword = async (req, res) => {
    try {
      await dbInstance.connect();
  
      let { email } = req.body;
      const otp = generateOTP();
      console.log(email);
  
      // Check if email is provided
      if (!email) {
        return res.status(400).json({
          status: 400,
          msg: "Please fill in mandatory fields",
        });
      }
  
      const userdata = await dbInstance.arr(
        `SELECT rst_id 
         FROM restaurant WHERE email=?`,
        [email]
      );

      if (!userdata) {
        return res.status(404).json({
          status: 404,
          msg: "User not found",
        });
      }
  
      const rst_id = userdata.rst_id;
  
      await dbInstance.query(
        `UPDATE restaurant SET otp=?,is_ver=? 
         WHERE email=?`,
        [otp,'No', email]
      );
  
      try {
        await sendOtpEmail(email, otp);
        return res.status(200).json({
          status: 200,
          data: { rst_id },
          msg: "OTP sent successfully",
        });
      } catch (emailError) {
        return res.status(500).json({
          status: 500,
          msg: "Error while sending OTP",
          error: emailError.message,
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };
  const OtpVerify = async (req, res) => {
    try {
      await dbInstance.connect();
  
      let { rst_id, otp } = req.body;  

      if (!rst_id || !otp) {
        return res.status(404).json({
          status: 404,
          msg: "Please fill in mandatory fields",
        });
      }
  
      const check = await dbInstance.num(
        `SELECT id 
         FROM restaurant WHERE rst_id=?`,
        [rst_id]
      );
  
      // If userdata exists, return success response
      if (check==0) {
        return res.status(400).json({
          msg: "User Not Found",
        });
      }

      const checkOtp = await dbInstance.num(
        `SELECT id 
         FROM restaurant WHERE rst_id=? AND otp=?`,
        [rst_id,otp]
      );

      if (checkOtp==0) {
        return res.status(201).json({
          "status":400,
          "msg": "Invalid OTP",
        });
      }else{

        const update = await dbInstance.query(
          `UPDATE restaurant SET is_ver=? WHERE rst_id=?`,
          ['Yes',rst_id]
        );

        return res.status(200).json({
          "status":200,
          "msg": "OTP Successfully Verified",
        });
      }

    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  const ResetPassword = async (req, res) => {
    try {
      await dbInstance.connect();
  
      let { rst_id, password,con_password } = req.body;  

      if (!rst_id || !password || !con_password) {
        return json({
          status: 404,
          msg: "Please fill in mandatory fields",
        });
      }
      if (password!=con_password) {
        return res.json({
          status: 404,
          msg: "Password And Confirm Password Are Not Matching",
        });
      }
  
      const check = await dbInstance.num(
        `SELECT id 
         FROM restaurant WHERE rst_id=?`,
        [rst_id]
      );
  
      // If userdata exists, return success response
      if (check==0) {
        return res.json({
          msg: "User Not Found",
        });
      }

      const checkOtp = await dbInstance.num(
        `SELECT id 
         FROM restaurant WHERE rst_id=? AND is_ver=?`,
        [rst_id,'Yes']
      );

      if (checkOtp==0) {
        return res.status(201).json({
          "status":400,
          "msg": "OTP is not verified",
        });
      }else{
        let hashedPassword = HashPassword(password);
        const update = await dbInstance.query(
          `UPDATE restaurant SET is_ver=?,password=? WHERE rst_id=?`,
          ['No',hashedPassword,rst_id]
        );
        return res.status(200).json({
          "status":200,
          "msg": "Password Reset Successfully",
        });
      }

    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  const LoginStaff = async (req, res) => {
    try {
      await dbInstance.connect();
  
      let { emp_id, password } = req.body;
  
      if (!emp_id || !password) {
        return res.status(404).json({
          status: 404,
          msg: "Please fill in mandatory fields",
        });
      }
  
      let hashedPassword = HashPassword(password);
  
      const userdata = await dbInstance.arr(
        `SELECT id, rst_id,emp_id 
         FROM staff WHERE emp_id=? AND password=?`,
        [emp_id, hashedPassword]
      );
  
      if (userdata) {
        return res.status(200).json({
          status: 200,
          data: userdata,
          msg: "Logged in successfully",
        });
      } else {
        return res.status(404).json({
          status: 404,
          msg: "Invalid credentials",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };


  module.exports = { Login,ForgotPassword,OtpVerify,ResetPassword,LoginStaff };