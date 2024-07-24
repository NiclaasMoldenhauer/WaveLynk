import nodemailer from 'nodemailer';
import path from 'path';
import dotenv from 'dotenv';
import hbs from 'nodemailer-express-handlebars';
import { fileURLToPath } from "node:url";

dotenv.config ();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const sendEmail = async (
    subject,
    send_to,
    send_from,
    reply_to,
    template,
    name,
    link
) => {
    const transporter = nodemailer.createTransport ({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER_EMAIL, // Gmail Account in .env
            pass: process.env.EMAIL_PASS // Gmail Password in .env
        },
        tls: {
            ciphers: 'SSLv3'
        },
    });

    const handleBarsOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve(__dirname, '../views'),
            defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, '../views'),
        extName: ".handlebars",
    };

    transporter.use("compile", hbs(handleBarsOptions));

    const mailOptions = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        template: template,
        context: {
          name: name,
          link: link,
        },
      };

    try {
        const info = await transporter.sendMail (mailOptions);
        console.log ("Nachricht verschickt: %s", info.messageId);
        return info;
    } catch (error) {
        console.log ("Fehler beim Versenden der E-Mail...", error);
        throw error;
    }
};

export default sendEmail;