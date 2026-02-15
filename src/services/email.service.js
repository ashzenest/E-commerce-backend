import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`, // sender address
      to,
      subject,
      text,
      html,
    });
    return true
  } catch (error) {
    console.error('Error sending email:', error);
    return false
  }
};

const sendEmailWithRetry = async(to, subject, text, html, maxRetries = 5) => {
    for(let tries = 0; tries <= maxRetries; tries++){
        const succeed = await sendEmail(to, subject, text, html)
        if(succeed){
            return true
        } else{
            console.warn(`Email could not be sent for ${tries} times`)
            if(tries < maxRetries){
                const delay = Math.pow(2, tries) * 1000  // 2s, 4s, 8s, 16s, 32s
                console.log(`Retrying in ${delay/1000} seconds...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
        
    }
    console.error(`Email failed after ${maxRetries} attempts`)
    return false
}

const sendRegistrationEmail = async(userEmail, fullname) => {
    const subject = "User successfully registered"
    const text = `Hello ${fullname},\n\n Thank you for registering to ${process.env.APP_NAME}\n Best regards,\n\n The ${process.env.APP_NAME} Team`
    const html = `<p>Hello ${fullname}</p><p>Thank you for registering to ${process.env.APP_NAME}</p><p>Best regards,<br> The ${process.env.APP_NAME} Team</p>`
    const sent = await sendEmailWithRetry(userEmail, subject, text, html)
    if(sent){
        console.log(`Registration Email sent successfully`)
    } else {
        console.error(`Could not sent Registration Email`)
    }
}
export {sendRegistrationEmail}