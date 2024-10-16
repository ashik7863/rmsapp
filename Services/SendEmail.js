const nodemailer = require('nodemailer');

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
  } catch (error) {
    console.log('Error sending email: ', error);
  }

  return otp;
}

