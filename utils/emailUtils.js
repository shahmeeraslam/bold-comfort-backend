import nodemailer from 'nodemailer';

// --- INITIALIZE TRANSPORTER ONCE ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * ADMIN ALERT: Triggered on new order
 */
export const sendAdminOrderEmail = async (order) => {
  const orderId = order._id.toString().slice(-6).toUpperCase();
  const adminUrl = process.env.ADMIN_URL || "https://timelesspk-frontend.vercel.app/admin";

  const mailOptions = {
    from: `"THE_ARCHIVE_SYSTEM" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, 
    subject: `🚨 SYSTEM_ALERT: NEW_ACQUISITION_${orderId}`,
    html: `
    <div style="background-color: #000000; color: #ffffff; padding: 40px; font-family: 'Courier New', Courier, monospace; border: 1px solid #1a1a1a; max-width: 600px; margin: auto;">
      
      <div style="border-bottom: 2px solid #ff3e3e; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="color: #ff3e3e; text-transform: uppercase; letter-spacing: 4px; margin: 0; font-size: 18px;">Registry_Update_Detected</h2>
        <p style="color: #444; font-size: 10px; margin-top: 5px;">TIMESTAMP_PKT: ${new Date().toLocaleString('en-PK')}</p>
      </div>

      <div style="background-color: #050505; border: 1px solid #111; padding: 25px; margin-bottom: 30px;">
        <p style="font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Customer_Identity</p>
        <div style="font-size: 13px; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #333;">NAME:</span> <span style="color: #fff;">${order.address.firstName} ${order.address.lastName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #333;">LOCATION:</span> <span style="color: #fff;">${order.address.city}, ${order.address.state}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #333;">CONTACT:</span> <span style="color: #fff;">${order.address.phone}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #333;">VALUATION:</span> <span style="color: #ff3e3e; font-weight: bold;">PKR ${Math.round(order.amount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #111; padding-bottom: 10px;">Item_Manifest</p>
        ${order.items.map(item => `
          <div style="padding: 12px 0; border-bottom: 1px solid #0a0a0a; font-size: 11px;">
            <span style="color: #fff; font-weight: bold;">[${item.quantity}x]</span> 
            <span style="color: #888; text-transform: uppercase;">${item.name}</span>
            <div style="color: #444; font-size: 9px; margin-top: 4px;">SPEC: ${item.size} // HEX: ${item.color}</div>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center;">
        <a href="${adminUrl}/orders" 
           style="display: inline-block; background-color: #ff3e3e; color: #ffffff; padding: 18px 35px; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; border-radius: 2px;">
          Access_Admin_Panel
        </a>
      </div>

      <div style="margin-top: 50px; text-align: center; border-top: 1px solid #111; padding-top: 20px;">
        <p style="color: #222; font-size: 8px; text-transform: uppercase; letter-spacing: 2px;">Automated_System_Notification // No_Reply_Required</p>
      </div>
    </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

// --- EXPORT CUSTOMER EMAIL AS WELL ---
export const sendOrderEmail = async (userEmail, order) => {
       const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const orderId = order._id.toString().slice(-6).toUpperCase();
  
  const mailOptions = {
    from: `"THE_ARCHIVE" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `ACQUISITION_CONFIRMED: #${orderId}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:italic&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica', Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #000000; border: 1px solid #1a1a1a;">
              
              <tr>
                <td style="padding: 50px 40px 30px 40px; border-bottom: 1px solid #1a1a1a;">
                  <h1 style="color: #ffffff; font-family: 'Playfair Display', serif; font-style: italic; font-size: 32px; margin: 0; letter-spacing: -1px;">The_Archive</h1>
                  <p style="color: #444; font-size: 9px; text-transform: uppercase; letter-spacing: 5px; margin-top: 10px; font-family: monospace;">Official_Acquisition_Registry</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <p style="color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin-bottom: 20px;">Receipt_Acknowledge</p>
                  <p style="color: #888; font-size: 13px; line-height: 1.8;">
                    Greetings <span style="color: #ffffff;">${order.address.firstName}</span>,<br><br>
                    Your acquisition request has been logged into the registry under index <span style="color: #ffffff; font-family: monospace;">#${orderId}</span>. The items listed below have been reserved for your collection.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th align="left" style="border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; color: #444; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Item_Description</th>
                        <th align="right" style="border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; color: #444; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Valuation</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${order.items.map(item => `
                        <tr>
                          <td style="padding: 20px 0; border-bottom: 1px solid #0a0a0a;">
                            <span style="color: #ffffff; font-size: 12px; font-weight: bold; display: block; text-transform: uppercase;">${item.name}</span>
                            <span style="color: #444; font-size: 10px; font-family: monospace;">SIZE: ${item.size} // QTY: ${item.quantity} // HEX: ${item.color}</span>
                          </td>
                          <td align="right" style="padding: 20px 0; border-bottom: 1px solid #0a0a0a; color: #ffffff; font-size: 12px; font-family: monospace;">
                            PKR ${Math.round(item.price).toLocaleString()}
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #050505; border: 1px solid #111; padding: 20px;">
                    <tr>
                      <td style="color: #444; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Total_Amount</td>
                      <td align="right" style="color: #ffffff; font-size: 18px; font-family: 'Playfair Display', serif; font-style: italic;">PKR ${order.amount.toLocaleString()}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <div style="border-left: 1px solid #ffffff; padding-left: 20px;">
                    <p style="color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Logistics_Protocol</p>
                    <p style="color: #666; font-size: 11px; line-height: 1.6; margin: 0;">
                      To authorize the dispatch to <span style="color: #fff;">${order.address.city}, ${order.address.state}</span>, our registry agent will verify your contact at <span style="color: #fff;">${order.address.phone}</span> within the next business cycle.
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding-bottom: 60px;">
                  <a href="${frontendUrl}/orders" style="background-color: #ffffff; color: #000000; padding: 15px 35px; text-decoration: none; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; display: inline-block;">
                    Track_Manifest
                  </a>
                </td>
              </tr>

              <tr>
                <td align="center" style="padding: 30px 40px; border-top: 1px solid #1a1a1a;">
                  <p style="color: #333; font-size: 8px; text-transform: uppercase; letter-spacing: 4px; margin: 0;">
                    Karachi_Node // Digital_Inventory // (c) 2026 The_Archive
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `
  };

  return transporter.sendMail(mailOptions);


};