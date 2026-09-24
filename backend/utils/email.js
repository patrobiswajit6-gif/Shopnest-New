const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

/**
 * Send an email using the configured SMTP transporter
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - Optional HTML body
 */
async function sendEmail({ to, subject, text, html }) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials are not configured. Email will be skipped in dev mode.')
        console.warn(`[DEV EMAIL] To: ${to} | Subject: ${subject} | Content: ${text}`)
        return
    }

    const mailOptions = {
        from: process.env.FROM_EMAIL || `"ShopNest" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`✉️ Email sent to ${to}: ${info.messageId}`)
        return info
    } catch (error) {
        console.error('Error sending email:', error)
        throw new Error('Failed to send email. Please try again.')
    }
}

module.exports = { sendEmail }
