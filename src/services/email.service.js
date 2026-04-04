import { transporter } from "../config/email.config.js";
import { logger } from "../config/logger.config.js";

const sendEmail = async (to, subject, text, html, reqId) => {
  const log = logger.child({
      phase: "email",
      operation: "sendEmail",
      reqId
  })
  log.info("Send email started")
  try {
    const info = await transporter.sendMail({
      from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    log.info("Email sent successfully")
    return true
  } catch (err) {
    log.error({err}, "Send email failed")
    throw err
  }
};

const sendRegistrationEmail = async(userEmail, fullname, reqId) => {
    const log = logger.child({
        phase: "email",
        operation: "sendRegistrationEmail",
        reqId
    })
    log.info("Send registration email started")
    const subject = "User successfully registered"
    const text = `Hello ${fullname},\n\n Thank you for registering to ${process.env.APP_NAME}\n Best regards,\n\n The ${process.env.APP_NAME} Team`
    const html = `<p>Hello ${fullname}</p><p>Thank you for registering to ${process.env.APP_NAME}</p><p>Best regards,<br> The ${process.env.APP_NAME} Team</p>`
    const sent = await sendEmail(userEmail, subject, text, html, reqId)
    if(sent){
      log.info(`Registration Email sent successfully`)
    }
}

const sendChangeEmailRequest = async(userEmail, fullname, magicLink, reqId) => {
  const log = logger.child({
      phase: "email",
      operation: "sendChangeEmailRequest",
      reqId
  })
  log.info("Send change email request started")
  const subject = "Confirm your Email change"
  const text = `Hello ${fullname}\n\n To confirm your email change, please click the link below:\n\n ${magicLink}\n\n This link expires in 15 minutes.\n\nIf you didn't request this change, please ignore this email.`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hello ${fullname},</p>
      <p>To confirm your email change, please click the button below:</p>
      <br>
      <a href="${magicLink}" 
         style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Email Change
      </a>
      <br><br>
      <p style="color: #666;">This link expires in 15 minutes.</p>
      <p style="color: #666;">If you didn't request this change, please ignore this email.</p>
    </div>`
  const sent = await sendEmail(userEmail, subject, text, html, reqId)
  if(sent){
    log.info("Change-email request sent successfully")
  }
}

const sendForgetPasswordEmail = async(userEmail, fullname, magicLink, reqId) => {
  const log = logger.child({
      phase: "email",
      operation: "sendForgetPasswordEmail",
      reqId
  })
  log.info("Send forget password email started")
  const subject = "Confirm your password reset"
  const text = `Hello ${fullname}\n\n To confirm your password reset, please click the link below:\n\n ${magicLink}\n\n This link expires in 15 minutes.\n\nIf you didn't request this change, please ignore this email.`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hello ${fullname},</p>
      <p>To confirm your password reset, please click the button below:</p>
      <br>
      <a href="${magicLink}" 
         style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Reset password
      </a>
      <br><br>
      <p style="color: #666;">This link expires in 15 minutes.</p>
      <p style="color: #666;">If you didn't request this change, please ignore this email.</p>
    </div>`

  const sent = await sendEmail(userEmail, subject, text, html, reqId)
  if(sent){
    log.info("Reset password link sent successfully")
  }
}

export {
  sendRegistrationEmail,
  sendChangeEmailRequest,
  sendForgetPasswordEmail
}