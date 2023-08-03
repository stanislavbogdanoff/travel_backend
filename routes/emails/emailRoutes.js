const express = require("express");
const router = express.Router();
const {
  sendPhoneEmail,
  sendOrderEmail,
  sendClientEmail,
  sendStatusEmail,
} = require("../../controllers/emails/emailController");

// New consult request email to administrator
router.post("/send-phone-email", (req, res) => {
  const { phone } = req.body;

  sendPhoneEmail(phone)
    .then(() => {
      console.log("Email sent successfully");
      res.send("Email sent successfully");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error sending email");
    });
});

// New order email to administrator
router.post("/send-order-email", (req, res) => {
  const { name, email, phone, hotel, sum, startDate, endDate } = req.body;

  const order = {
    name,
    email,
    phone,
    hotel,
    sum,
    startDate,
    endDate,
  };

  sendOrderEmail(order)
    .then(() => {
      console.log("Email sent successfully");
      res.send("Email sent successfully");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error sending email");
    });
});

// Confirmation email to client
router.post("/send-client-email", (req, res) => {
  const { name, email } = req.body;

  sendClientEmail(name, email)
    .then(() => {
      console.log("Email sent successfully");
      res.send("Email sent successfully");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error sending email");
    });
});

// Status update email to client
router.post("/send-status-email", (req, res) => {
  const { status, uid, email } = req.body;

  sendStatusEmail(status, uid, email)
    .then(() => {
      console.log("Email sent successfully");
      res.send("Email sent successfully");
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error sending email");
    });
});

module.exports = router;
