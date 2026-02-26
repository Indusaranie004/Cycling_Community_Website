const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMonthlyReport = async (userEmail, userName, stats, communityStats) => {
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">🚴 Monthly Eco Report</h2>
      <p>Hi ${userName},</p>
      <p>Here is your cycling impact for this month.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Stats</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>CO2 Saved:</strong> ${stats.totalCo2.toFixed(2)} kg</li>
          <li><strong>Eco Score:</strong> ${stats.totalScore} pts</li>
        </ul>
      </div>

      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Community Impact 🌍</h3>
        <p>Together, we have saved <strong>${communityStats.total_community_co2_saved.toFixed(2)} kg</strong> of CO2!</p>
      </div>
      <p style="text-align: center; color: #777; font-size: 12px;">- The EcoCycle Team</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: userEmail,
      subject: 'Your Monthly Eco Impact Report 🌿',
      html: emailContent
    });

    console.log(`✅ Email sent to ${userEmail} | ID: ${data.id}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${userEmail}:`, error);
  }
};

module.exports = { sendMonthlyReport };