// server/src/services/email.service.js
const nodemailer = require("nodemailer");

// ===== TRANSPORTER =====
// Sử dụng Ethereal (fake SMTP) cho dev, Gmail App Password cho production.
// Cấu hình qua biến môi trường EMAIL_HOST, EMAIL_USER, EMAIL_PASS.

let transporter;

const createTransporter = async () => {
  // Nếu đã có biến môi trường email → dùng cấu hình thực
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("✓ Email transporter: Custom SMTP");
    return transporter;
  }

  // Fallback: Tạo tài khoản Ethereal giả lập cho dev
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log("✓ Email transporter: Ethereal (dev mode)");
  console.log(`  Ethereal user: ${testAccount.user}`);
  return transporter;
};

// ===== GỬI EMAIL XÁC THỰC OTP =====
const sendVerificationEmail = async (email, otpCode) => {
  if (!transporter) {
    await createTransporter();
  }

  const mailOptions = {
    from: `"Nyan Market" <${process.env.EMAIL_USER || "noreply@nyanmarket.com"}>`,
    to: email,
    subject: "Nyan Market — Mã xác thực OTP",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #FACC15; color: #1F2937; font-size: 24px; font-weight: bold; width: 48px; height: 48px; line-height: 48px; border-radius: 12px;">N</div>
        </div>
        <h2 style="text-align: center; color: #1F2937; margin: 0 0 8px;">Xác thực tài khoản</h2>
        <p style="text-align: center; color: #6B7280; margin: 0 0 24px;">Sử dụng mã OTP bên dưới để hoàn tất đăng ký.</p>
        <div style="text-align: center; background: #F8F8F8; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${otpCode}</span>
        </div>
        <p style="text-align: center; color: #EF4444; font-size: 14px; margin: 0;">Mã có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin: 0;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email này.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // Log preview URL nếu dùng Ethereal (dev)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`  📧 Email preview: ${previewUrl}`);
  }

  return info;
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
};
