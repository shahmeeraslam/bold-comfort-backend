import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOrderEmail = async (userEmail, order) => {
  // 1. Resolve Frontend URL inside the function to ensure process.env is ready
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  // 2. Format Order ID for the "Archive" aesthetic
  const orderId = order._id.toString().slice(-6).toUpperCase();
  
  const mailOptions = {
    from: `"THE_ARCHIVE" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `ORDER_CONFIRMATION: #${orderId}`,
    html: `
    <div style="background-color: #050505; color: #ffffff; padding: 40px; font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: auto; border: 1px solid #222;">
      
      <div style="text-align: center; border-bottom: 1px solid #222; padding-bottom: 30px;">
        <h1 style="text-transform: uppercase; letter-spacing: 8px; font-style: italic; margin: 0;">THANK_YOU</h1>
        <p style="font-size: 10px; color: #666; letter-spacing: 3px; margin-top: 10px;">ORDER_LOGGED: ${new Date().toLocaleDateString()}</p>
      </div>

      <div style="padding: 40px 0;">
        <p style="font-size: 14px; line-height: 1.6; color: #bbb;">
          Greetings <span style="color: #fff;">${order.address.firstName || 'Client'}</span>,
        </p>
        <p style="font-size: 12px; line-height: 1.6; color: #888;">
          Your acquisition request has been successfully registered under index <strong style="color: #fff;">#${orderId}</strong>. 
          Our curator will review the items shortly.
        </p>

        <div style="background-color: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; margin: 30px 0;">
          <p style="font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Manifest_Items</p>
          
          ${order.items.map(item => {
            // Fallback for item name if it's nested or missing
            const name = item.name || (item.productId && item.productId.name) || "UNIDENTIFIED_PIECE";
            const price = item.price || (item.productId && item.productId.price) || 0;
            
            return `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 11px;">
                <span style="color: #fff;">${item.quantity}x ${name} (${item.size || 'N/A'})</span>
                <span style="color: #888;">PKR ${Math.round(price).toLocaleString()}</span>
              </div>
            `;
          }).join('')}

          <div style="border-top: 1px solid #1a1a1a; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold;">
            <span style="color: #666; font-size: 10px; text-transform: uppercase;">Total_Valuation</span>
            <span style="color: #fff;">PKR ${order.amount.toLocaleString()}</span>
          </div>
        </div>

        <div style="border-left: 2px solid #fff; padding-left: 20px; margin: 40px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #fff;">Protocol: Voice_Verification</p>
          <p style="font-size: 11px; color: #888; line-height: 1.5;">
            To finalize the shipment to <span style="color: #fff;">${order.address.city}</span>, our team will contact you at 
            <span style="color: #fff;">${order.address.phone}</span> within the next 24 hours.
          </p>
        </div>

        <div style="text-align: center; margin-top: 50px;">
          <a href="${frontendUrl}/orders" 
             style="display: inline-block; padding: 18px 40px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px;">
            Track_Your_Manifest
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #222; padding-top: 30px; text-align: center;">
        <p style="font-size: 8px; color: #333; text-transform: uppercase; letter-spacing: 2px;">
          The_Archive // Karachi_Node // Secure_Transaction
        </p>
      </div>
    </div>
    `
  };

  return transporter.sendMail(mailOptions);
};