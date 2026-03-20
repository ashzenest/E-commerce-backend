import nodemailer from "nodemailer"
import { logger } from "./logger.config.js";

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

transporter.verify((err, success) => {
  if (err) {
    logger.catastrophe({err}, 'Error connecting to email server');
  } else {
    logger.info('Email server is ready to send messages');
  }
});

export {transporter}