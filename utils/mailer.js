import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `All-In-One-Store ${process.env.EMAIL_USER}`,
      to,
      subject,
      html,
    });

    console.log("Email Sent: ", info);
    return true;
  } catch (error) {
    console.log("Email Error: ", error.message);
    return false;
  }
};
