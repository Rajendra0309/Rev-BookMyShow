const nodemailer = require('nodemailer');
const dns = require('dns');

const ipv4Lookup = (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
};

const sendTicketEmail = async (toEmail, userName, pdfBuffer, movieTitle) => {
    try {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;

        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
            console.warn('⚠️ [Email Service Bypass]: SMTP credentials are not fully configured in your backend .env file. Email dispatch skipped.');
            return false;
        }

        let transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10) || 587,
            secure: parseInt(SMTP_PORT, 10) === 465,
            family: 4,
            lookup: ipv4Lookup,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS
            }
        });

        try {
            await transporter.verify();
        } catch (firstErr) {
            console.warn('⚠️ IPv4 SMTP connection verification failed, falling back to default resolution:', firstErr.message);
            transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: parseInt(SMTP_PORT, 10) || 587,
                secure: parseInt(SMTP_PORT, 10) === 465,
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS
                }
            });
        }

        const mailOptions = {
            from: `"Rev-BookMyShow" <${FROM_EMAIL || SMTP_USER}>`,
            to: toEmail,
            subject: `🎟️ Your Ticket Confirmation: ${movieTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <div style="background-color: #dc3545; color: white; padding: 15px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi <strong>${userName}</strong>,</p>
                        <p>Thank you for booking your movie tickets with <strong>Rev-BookMyShow</strong>. Your payment has been processed successfully.</p>
                        <p>We have generated your secure entry ticket. Please find the attached PDF containing your booking details and a scannable QR code for entry.</p>
                        <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #edf2f7;">
                            <h3 style="margin-top: 0; color: #2d3748;">Booking Summary:</h3>
                            <p style="margin: 5px 0;"><strong>Movie:</strong> ${movieTitle}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> Paid & Confirmed</p>
                        </div>
                        <p>Please present the QR code in the attached PDF ticket at the cinema entry gate.</p>
                        <p>Enjoy your movie!</p>
                        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #718096; text-align: center;">This is an automated receipt email. Please do not reply directly.</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `ticket_${movieTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Confirmation email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error('❌ Failed to dispatch ticket confirmation email:', error.message);
        return false;
    }
};

module.exports = { sendTicketEmail };
