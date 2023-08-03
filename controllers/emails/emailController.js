const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "stanislav.tiryoshin@gmail.com",
    pass: process.env.GMAIL_PASS,
  },
});

// New consult request email to administrator
const sendPhoneEmail = (phone) => {
  const mailOptions = {
    from: "stanislav.tiryoshin@gmail.com",
    to: "stanislav.tiryoshin@gmail.com",
    subject: "Заявка на консультацию",
    text: `Поступила новая заявка на консультацию. Телефон: ${phone}`,
    html: `Поступила новая заявка на консультацию. <br> <div> Телефон: <a style='text-decoration:none;width:fit-content;display:flex;align-items:center;justify-content:center;background-color:rgba(94, 178, 21, 1);padding:10px;border-radius:5px;color:#fff' href="tel:${phone}">${phone}</a> </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// New order email to administrator
const sendOrderEmail = (order) => {
  const { name, email, phone, hotel, sum, startDate, endDate, room } = order;

  const mailOptions = {
    from: "stanislav.tiryoshin@gmail.com",
    to: "stanislav.tiryoshin@gmail.com",
    subject: "Новый заказ",
    html: `Поступил новый заказ. <br> <div> Телефон: <a href="tel:${phone}">${phone}</a>, <br> email: <a href="mailto:${email}">${email}</a>, <br> имя: ${name}, <br> hotel: ${hotel}, <br> room: ${room}, <br> sum: ${sum}, <br> startDate: ${new Date(
      +startDate
    ).toLocaleDateString()}, <br> endDate: ${new Date(
      +endDate
    ).toLocaleDateString()} </div>`,
  };

  return transporter.sendMail(mailOptions);
};

// Confirmation email to client
const sendClientEmail = (name, email) => {
  const mailOptions = {
    from: "stanislav.tiryoshin@gmail.com",
    to: email,
    subject: "Ваша заявка получена",
    html: `${name}, Ваша заявка получена администратором. С Вами свяжутся в ближайшее время.`,
  };

  return transporter.sendMail(mailOptions);
};

// Order status update
const sendStatusEmail = (status, uid, email) => {
  const mailOptions = {
    from: "stanislav.tiryoshin@gmail.com",
    to: email,
    subject: "Статус вашего заказа изменен",
    html: `Статус вашего заказа #${uid} изменен. Статус: ${status}`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendPhoneEmail,
  sendOrderEmail,
  sendClientEmail,
  sendStatusEmail,
};
