const nodemailer = require("nodemailer");
// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};
// Send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Fashion App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Welcome to Fashion Budgeting & Outfit Visualization!",
      html: ` 
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"> 
          <h1 style="color: #333; text-align: center;">Welcome to Fashion App!</h1> 
          <p>Dear ${userName},</p> 
          <p>Thank you for joining our fashion budgeting and outfit visualization platform! We're 
excited to help you manage your wardrobe and create amazing outfits.</p> 
           
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 
20px 0;"> 
            <h3>Getting Started:</h3> 
            <ul> 
              <li>Add your clothing items to your digital wardrobe</li> 
              <li>Set up your budget preferences</li> 
              <li>Create stunning outfit combinations</li> 
              <li>Track your fashion spending</li> 
            </ul> 
          </div> 
           
          <p>If you have any questions, feel free to contact our support team.</p> 
          <p>Happy styling!</p> 
          <p>The Fashion App Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

// Send password reset email
const sendPasswordResetEmail = async (userEmail, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset
password?token=${resetToken}`;

    const mailOptions = {
      from: `"Fashion App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset Request",
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"> 
          <h1 style="color: #333; text-align: center;">Password Reset Request</h1> 
          <p>Dear ${userName},</p> 
          <p>You have requested to reset your password. Click the button below to reset it:</p> 
           
          <div style="text-align: center; margin: 30px 0;"> 
            <a href="${resetUrl}"  
               style="background-color: #007bff; color: white; padding: 12px 24px;  
                      text-decoration: none; border-radius: 5px; display: inline-block;"> 
              Reset Password 
            </a> 
          </div> 
           
          <p style="color: #666; font-size: 14px;"> 
            If the button doesn't work, copy and paste this link into your browser:<br> 
            <a href="${resetUrl}">${resetUrl}</a> 
          </p> 
           
          <p style="color: #666; font-size: 14px;"> 
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email. 
          </p> 
           
          <p>Best regards,<br>The Fashion App Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Send budget alert email
const sendBudgetAlertEmail = async (userEmail, userName, alertData) => {
  try {
    const transporter = createTransporter();
    const { budgetAmount, spentAmount, percentage, alertType } = alertData;

    let subject, message;

    switch (alertType) {
      case "warning":
        subject = "Budget Warning - Fashion App";
        message = `You've spent ${percentage}% of your budget this month.`;
        break;
      case "exceeded":
        subject = "Budget Exceeded - Fashion App";
        message = `You have exceeded your monthly budget by $${(
          spentAmount - budgetAmount
        ).toFixed(2)}.`;
        break;
      case "approaching":
        subject = "Budget Alert - Fashion App";
        message = `You're approaching your monthly budget limit.`;
        break;
      default:
        subject = "Budget Alert - Fashion App";
        message = "Budget alert notification.";
    }

    const mailOptions = {
      from: `"Fashion App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"> 
          <h1 style="color: #e74c3c; text-align: center;">Budget Alert</h1> 
          <p>Dear ${userName},</p> 
          <p>${message}</p> 
           
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 
20px 0;"> 
            <h3>Budget Summary:</h3> 
            <ul> 
              <li>Monthly Budget: $${budgetAmount.toFixed(2)}</li> 
              <li>Amount Spent: $${spentAmount.toFixed(2)}</li> 
              <li>Percentage Used: ${percentage}%</li> 
            </ul> 
          </div> 
           
          <p>Consider reviewing your spending habits and adjust your budget if necessary.</p> 
          <p>Best regards,<br>The Fashion App Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Budget alert email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending budget alert email:", error);
    throw new Error("Failed to send budget alert email");
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, userName, orderData) => {
  try {
    const transporter = createTransporter();
    const { orderId, items, totalAmount, paymentMethod } = orderData;

    const itemsList = items
      .map((item) => `<li>${item.name} - $${item.price.toFixed(2)}</li>`)
      .join("");

    const mailOptions = {
      from: `"Fashion App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - ${orderId}`,
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"> 
          <h1 style="color: #28a745; text-align: center;">Order Confirmed!</h1> 
          <p>Dear ${userName},</p> 
          <p>Thank you for your purchase! Your order has been confirmed.</p> 
           
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 
20px 0;"> 
            <h3>Order Details:</h3> 
            <p><strong>Order ID:</strong> ${orderId}</p> 
            <p><strong>Payment Method:</strong> ${paymentMethod}</p> 
             
            <h4>Items Purchased:</h4> 
            <ul>${itemsList}</ul> 
             
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p> 
          </div> 
           
          <p>These items have been added to your digital wardrobe and are ready for outfit 
creation!</p> 
          <p>Best regards,<br>The Fashion App Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw new Error("Failed to send order confirmation email");
  }
};

// Send monthly spending report email
const sendMonthlyReportEmail = async (userEmail, userName, reportData) => {
  try {
    const transporter = createTransporter();
    const {
      month,
      year,
      totalSpent,
      budgetAmount,
      topCategories,
      savingsGoal,
    } = reportData;

    const categoriesList = topCategories
      .map((cat) => `<li>${cat.name}: $${cat.amount.toFixed(2)}</li>`)
      .join("");

    const mailOptions = {
      from: `"Fashion App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Monthly Fashion Report - ${month} ${year}`,
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"> 
          <h1 style="color: #333; text-align: center;">Your Monthly Fashion Report</h1> 
          <p>Dear ${userName},</p> 
          <p>Here's your fashion spending summary for ${month} ${year}:</p> 
           
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 
20px 0;"> 
            <h3>Spending Summary:</h3> 
            <ul> 
              <li>Total Spent: $${totalSpent.toFixed(2)}</li> 
              <li>Budget Amount: $${budgetAmount.toFixed(2)}</li> 
              <li>Remaining Budget: $${(budgetAmount - totalSpent).toFixed(
                2
              )}</li> 
            </ul> 
             
            <h4>Top Spending Categories:</h4> 
            <ul>${categoriesList}</ul> 
          </div> 
           
          <p>Keep up the great work managing your fashion budget!</p> 
          <p>Best regards,<br>The Fashion App Team</p> 
        </div> 
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Monthly report email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending monthly report email:", error);
    throw new Error("Failed to send monthly report email");
  }
};

// Send size alert email for kids wear
const sendSizeAlertEmail = async (userEmail, userName, sizeAlertData) => {
  try {
    const transporter = createTransporter();
    const { childName, outgrownItems } = sizeAlertData;

    const itemsList = outgrownItems
      .map(
        (item) =>
          `<li>${item.name} - Current Size: ${item.currentSize}, Suggested Size: 
${item.suggestedSize}</li>`
      )
      .join("");

    const mailOptions = {
      from: `"Fashion App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Size Alert - Kids Clothing Update Needed",
      html: ` 
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"> 
          <h1 style="color: #ff6b35; text-align: center;">Size Alert!</h1> 
          <p>Dear ${userName},</p> 
          <p>It looks like ${childName} may have outgrown some clothing items. Here are the 
items that may need size updates:</p> 
           
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 
20px 0;"> 
            <h3>Items Needing Size Updates:</h3> 
            <ul>${itemsList}</ul> 
          </div> 
           
          <p>Consider updating these items in your wardrobe or shopping for new sizes.</p> 
          <p>Best regards,<br>The Fashion App Team</p> 
</div> 
`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Size alert email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending size alert email:", error);
    throw new Error("Failed to send size alert email");
  }
};
// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email service connected successfully");
    return true;
  } catch (error) {
    console.error("Email service connection failed:", error);
    return false;
  }
};
module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBudgetAlertEmail,
  sendOrderConfirmationEmail,
  sendMonthlyReportEmail,
  sendSizeAlertEmail,
  testEmailConnection,
};
