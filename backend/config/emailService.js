// const nodemailer = require('nodemailer');

// class EmailService {
//   constructor() {
//     this.transporter = null;
//     this.isConfigured = false;
//     this.initializeTransporter();
//   }

//   async initializeTransporter() {
//     try {
//       // Updated: Use Gmail App Password configuration that we tested
//       if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
//         console.log('⚠️ Email service not configured - missing EMAIL_USER or EMAIL_APP_PASSWORD');
//         console.log('Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
//         return;
//       }

//       // Gmail SMTP configuration with App Password (tested and working)
//       this.transporter = nodemailer.createTransport({
//         service: 'gmail',
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_APP_PASSWORD // Updated to use app password
//         },
//         pool: true, // Use connection pooling for better performance
//         maxConnections: 5,
//         maxMessages: 100,
//         rateDelta: 20000, // 20 seconds
//         rateLimit: 5, // Max 5 emails per rate delta
//         tls: {
//           rejectUnauthorized: true,
//           minVersion: 'TLSv1.2'
//         }
//       });

//       // Verify the connection
//       await this.transporter.verify();
//       this.isConfigured = true;
//       console.log('✅ The Melissa NYC email service configured successfully with Gmail SMTP');
      
//     } catch (error) {
//       console.error('❌ Email service configuration failed:', error);
      
//       // Provide helpful error messages
//       if (error.code === 'EAUTH') {
//         console.error('🔐 Gmail authentication failed. Please check:');
//         console.error('   1. EMAIL_USER is your correct Gmail address');
//         console.error('   2. EMAIL_APP_PASSWORD is the 16-character app password');
//         console.error('   3. 2-Factor Authentication is enabled on Gmail');
//         console.error('   4. App password was generated correctly');
//       }
      
//       this.isConfigured = false;
//     }
//   }

//   // Test email configuration
//   async testConnection() {
//     if (!this.isConfigured) {
//       return { success: false, message: 'Email service not configured' };
//     }

//     try {
//       await this.transporter.verify();
//       console.log('✅ Email server connection verified');
//       return { success: true, message: 'Email server connection successful' };
//     } catch (error) {
//       console.error('❌ Email server connection failed:', error);
//       return { success: false, message: 'Email server connection failed', error: error.message };
//     }
//   }

//   // Enhanced send email method with better error handling
//   async sendEmail(mailOptions) {
//     if (!this.isConfigured) {
//       console.warn('⚠️ Email service not configured - email sending disabled');
//       return { success: false, simulated: true, message: 'Email service not configured' };
//     }

//     try {
//       const info = await this.transporter.sendMail(mailOptions);
//       console.log(`✅ Email sent successfully to ${mailOptions.to}`);
//       console.log(`📧 Message ID: ${info.messageId}`);
      
//       return { 
//         success: true, 
//         messageId: info.messageId,
//         accepted: info.accepted,
//         rejected: info.rejected
//       };
      
//     } catch (error) {
//       console.error('❌ Email send failed:', error);
      
//       let errorMessage = 'Failed to send email';
//       let errorCode = 'SEND_ERROR';
      
//       if (error.code === 'EMESSAGE') {
//         errorMessage = 'Invalid email content or format';
//         errorCode = 'INVALID_MESSAGE';
//       } else if (error.code === 'EAUTH') {
//         errorMessage = 'Email authentication failed';
//         errorCode = 'AUTH_ERROR';
//       } else if (error.responseCode === 550) {
//         errorMessage = 'Recipient email address rejected';
//         errorCode = 'RECIPIENT_REJECTED';
//       }
      
//       return { 
//         success: false, 
//         error: errorMessage,
//         code: errorCode,
//         details: error.message 
//       };
//     }
//   }

//   // Send verification email
//   async sendVerificationEmail(user, token) {
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating verification email');
//       return { success: false, simulated: true };
//     }

//     const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
//     const fullName = `${user.firstName} ${user.lastName}`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: 'Verify Your Email Address - The Melissa NYC',
//       html: this.getVerificationEmailTemplate(fullName, user.username, verificationUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Verification email sent to:', user.email);
//     } else {
//       console.error('❌ Verification email failed for:', user.email);
//     }
    
//     return result;
//   }

//   // Send welcome email after verification
//   async sendWelcomeEmail(user) {
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating welcome email');
//       return { success: false, simulated: true };
//     }

//     const fullName = `${user.firstName} ${user.lastName}`;
//     const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: '🎉 Email Verified Successfully - The Melissa NYC',
//       html: this.getWelcomeEmailTemplate(fullName, user.role, loginUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Welcome email sent to:', user.email);
//     }
    
//     return result;
//   }

//   // Send approval notification
//   async sendApprovalNotification(user) {
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating approval email');
//       return { success: false, simulated: true };
//     }

//     const fullName = `${user.firstName} ${user.lastName}`;
//     const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: '🎉 Account Approved - Welcome to The Melissa NYC!',
//       html: this.getApprovalEmailTemplate(fullName, loginUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Approval email sent to:', user.email);
//     }
    
//     return result;
//   }

//   // Send rejection notification
//   async sendRejectionNotification(user, reason = 'Administrative decision') {
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating rejection email');
//       return { success: false, simulated: true };
//     }

//     const fullName = `${user.firstName} ${user.lastName}`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: 'Account Registration Update - The Melissa NYC',
//       html: this.getRejectionEmailTemplate(fullName, reason)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Rejection email sent to:', user.email);
//     }
    
//     return result;
//   }

//   // Send notification to admins about new user pending approval
//   async sendNewUserNotification(adminEmail, newUser) {
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating admin notification');
//       return { success: false, simulated: true };
//     }

//     const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/users/pending`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: adminEmail,
//       subject: '🔔 New User Pending Approval - The Melissa NYC',
//       html: this.getAdminNotificationTemplate(newUser, dashboardUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Admin notification sent to:', adminEmail);
//     }
    
//     return result;
//   }

//   // Enhanced verification email template with better styling
//   getVerificationEmailTemplate(fullName, username, verificationUrl) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Verify Your Email - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #2c3e50, #34495e); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .header h1 { 
//             margin: 0 0 10px 0; 
//             font-size: 28px; 
//             font-weight: 300;
//           }
//           .content { padding: 40px 30px; }
//           .content h2 { 
//             color: #2c3e50; 
//             margin-top: 0; 
//             font-size: 24px;
//           }
//           .button-container { 
//             text-align: center; 
//             margin: 30px 0; 
//           }
//           .verify-button { 
//             display: inline-block; 
//             background: #3498db; 
//             color: white !important; 
//             padding: 15px 30px; 
//             text-decoration: none; 
//             border-radius: 6px; 
//             font-weight: bold; 
//             font-size: 16px;
//             transition: background-color 0.3s ease;
//           }
//           .verify-button:hover { 
//             background: #2980b9; 
//           }
//           .warning { 
//             background: #fff8e1; 
//             border-left: 4px solid #ffa726; 
//             padding: 15px 20px; 
//             margin: 25px 0; 
//             border-radius: 4px;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//           .link-fallback { 
//             background: #f8f9fa; 
//             padding: 15px; 
//             border-radius: 4px; 
//             margin: 20px 0; 
//             word-break: break-all;
//             font-family: 'Courier New', monospace;
//             font-size: 12px;
//             color: #555;
//           }
//           @media only screen and (max-width: 600px) {
//             .email-container { margin: 10px; }
//             .header, .content { padding: 25px 20px; }
//             .header h1 { font-size: 24px; }
//             .verify-button { padding: 12px 25px; font-size: 14px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🏢 The Melissa NYC</h1>
//             <p>Luxury Property Management</p>
//           </div>
          
//           <div class="content">
//             <h2>Welcome, ${fullName}!</h2>
//             <p>Your admin account (<strong>@${username}</strong>) has been created for The Melissa NYC property management system. Please verify your email address to complete the registration process.</p>
            
//             <div class="button-container">
//               <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
//             </div>
            
//             <div class="warning">
//               <strong>⏰ Important:</strong> This verification link will expire in 24 hours. Please verify your email as soon as possible.
//             </div>
            
//             <p><strong>Next Steps:</strong></p>
//             <ol>
//               <li>Click the verification button above</li>
//               <li>Wait for admin approval (you'll get another email)</li>
//               <li>Login and start managing properties</li>
//             </ol>
            
//             <p>If you didn't create this account, please ignore this email.</p>
            
//             <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
//             <p><strong>Having trouble with the button?</strong> Copy and paste this link:</p>
//             <div class="link-fallback">${verificationUrl}</div>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//             <p>This is an automated message, please do not reply.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getWelcomeEmailTemplate(fullName, role, loginUrl) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Email Verified - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #27ae60, #2ecc71); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; }
//           .success-badge { 
//             background: #d4edda; 
//             color: #155724; 
//             padding: 20px; 
//             border-radius: 6px; 
//             text-align: center; 
//             margin: 25px 0; 
//             border: 1px solid #c3e6cb;
//           }
//           .info-box { 
//             background: #f8f9fa; 
//             padding: 20px; 
//             border-radius: 6px; 
//             margin: 25px 0; 
//             border-left: 4px solid #007bff;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//           @media only screen and (max-width: 600px) {
//             .email-container { margin: 10px; }
//             .header, .content { padding: 25px 20px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🎉 Email Verified!</h1>
//             <p>The Melissa NYC</p>
//           </div>
          
//           <div class="content">
//             <div class="success-badge">
//               <h3 style="margin: 0 0 10px 0;">✅ Email Verification Complete!</h3>
//               <p style="margin: 0;">Your account is now pending admin approval.</p>
//             </div>
            
//             <h2>Hello ${fullName},</h2>
//             <p>Great! Your email has been successfully verified. Your account is now pending approval from our administrators.</p>
            
//             <div class="info-box">
//               <h3 style="margin-top: 0;">Account Details:</h3>
//               <ul style="margin: 10px 0;">
//                 <li><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</li>
//                 <li><strong>Status:</strong> ✅ Email Verified, ⏳ Pending Approval</li>
//               </ul>
//             </div>
            
//             <h3>What happens next?</h3>
//             <ol>
//               <li>Our admin team will review your account within 24-48 hours</li>
//               <li>You'll receive an email notification once approved</li>
//               <li>After approval, you can login and access the system</li>
//             </ol>
            
//             <p>You'll receive another email once your account has been approved and activated.</p>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getApprovalEmailTemplate(fullName, loginUrl) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Account Approved - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #28a745, #20c997); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; text-align: center; }
//           .login-button { 
//             display: inline-block; 
//             background: #28a745; 
//             color: white !important; 
//             padding: 15px 30px; 
//             text-decoration: none; 
//             border-radius: 6px; 
//             font-weight: bold; 
//             font-size: 16px;
//             margin: 20px 0;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🎉 Account Approved!</h1>
//             <p>Welcome to The Melissa NYC</p>
//           </div>
          
//           <div class="content">
//             <h2>Welcome Aboard, ${fullName}!</h2>
//             <p>Great news! Your admin account has been approved and is now active. You can now access the property management system and begin managing units, contacts, and gallery content.</p>
            
//             <div style="margin: 35px 0;">
//               <a href="${loginUrl}" class="login-button">Login to Dashboard</a>
//             </div>
            
//             <p>If you have any questions, please don't hesitate to contact our support team.</p>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getRejectionEmailTemplate(fullName, reason) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Registration Update - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #6c757d, #495057); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; }
//           .reason-box { 
//             background: #fff3cd; 
//             padding: 15px; 
//             border-radius: 6px; 
//             margin: 20px 0; 
//             border-left: 4px solid #ffc107;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>Registration Update</h1>
//             <p>The Melissa NYC</p>
//           </div>
          
//           <div class="content">
//             <h2>Dear ${fullName},</h2>
//             <p>Thank you for your interest in joining The Melissa NYC property management team. After careful review, we are unable to approve your account registration at this time.</p>
            
//             ${reason !== 'Administrative decision' ? `
//             <div class="reason-box">
//               <p style="color: #856404; margin: 0; font-weight: 500;"><strong>Reason:</strong> ${reason}</p>
//             </div>
//             ` : ''}
            
//             <p>If you believe this was an error or would like to discuss your application further, please contact our administrator directly.</p>
//             <p>Thank you for your understanding.</p>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getAdminNotificationTemplate(newUser, dashboardUrl) {
//     const fullName = `${newUser.firstName} ${newUser.lastName}`;
    
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>New User Pending Approval - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #17a2b8, #138496); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; }
//           .user-info { 
//             background: #f8f9fa; 
//             padding: 20px; 
//             border-radius: 8px; 
//             margin: 25px 0; 
//             border-left: 4px solid #17a2b8;
//           }
//           .review-button { 
//             display: inline-block; 
//             background: #17a2b8; 
//             color: white !important; 
//             padding: 15px 30px; 
//             text-decoration: none; 
//             border-radius: 6px; 
//             font-weight: bold; 
//             font-size: 16px;
//             margin: 20px 0;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🔔 New User Pending Approval</h1>
//             <p>The Melissa NYC Admin Notification</p>
//           </div>
          
//           <div class="content">
//             <h2>New User Awaiting Approval</h2>
//             <p>A new user has completed email verification and is awaiting approval:</p>
            
//             <div class="user-info">
//               <div style="display: grid; gap: 8px;">
//                 <p style="margin: 0; color: #333;"><strong>Name:</strong> ${fullName}</p>
//                 <p style="margin: 0; color: #333;"><strong>Username:</strong> @${newUser.username}</p>
//                 <p style="margin: 0; color: #333;"><strong>Email:</strong> ${newUser.email}</p>
//                 <p style="margin: 0; color: #333;"><strong>Role:</strong> ${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}</p>
//                 <p style="margin: 0; color: #333;"><strong>Registration:</strong> ${newUser.createdAt.toLocaleDateString()}</p>
//               </div>
//             </div>
            
//             <div style="text-align: center; margin: 35px 0;">
//               <a href="${dashboardUrl}" class="review-button">Review Application →</a>
//             </div>
            
//             <p>Please review the application and either approve or reject the user account from the admin dashboard.</p>
//           </div>
          
//           <div class="footer">
//             <p>This is an automated notification from The Melissa NYC property management system.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }
// }

// module.exports = new EmailService();

// const nodemailer = require('nodemailer');

// class EmailService {
//   constructor() {
//     this.transporter = null;
//     this.isConfigured = false;
//     this.initializationPromise = null;
    
//     // Start initialization but don't wait for it
//     this.initializationPromise = this.initializeTransporter();
//   }

//   async initializeTransporter() {
//     try {
//       // Updated: Use Gmail App Password configuration that we tested
//       if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
//         console.log('⚠️ Email service not configured - missing EMAIL_USER or EMAIL_APP_PASSWORD');
//         console.log('Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
//         this.isConfigured = false;
//         return false;
//       }

//       // Gmail SMTP configuration with App Password (tested and working)
//       this.transporter = nodemailer.createTransport({
//         service: 'gmail',
//         host: 'smtp.gmail.com',
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_APP_PASSWORD // Updated to use app password
//         },
//         pool: true, // Use connection pooling for better performance
//         maxConnections: 5,
//         maxMessages: 100,
//         rateDelta: 20000, // 20 seconds
//         rateLimit: 5, // Max 5 emails per rate delta
//         tls: {
//           rejectUnauthorized: true,
//           minVersion: 'TLSv1.2'
//         }
//       });

//       // Verify the connection
//       await this.transporter.verify();
//       this.isConfigured = true;
//       console.log('✅ The Melissa NYC email service configured successfully with Gmail SMTP');
//       return true;
      
//     } catch (error) {
//       console.error('❌ Email service configuration failed:', error);
      
//       // Provide helpful error messages
//       if (error.code === 'EAUTH') {
//         console.error('🔐 Gmail authentication failed. Please check:');
//         console.error('   1. EMAIL_USER is your correct Gmail address');
//         console.error('   2. EMAIL_APP_PASSWORD is the 16-character app password');
//         console.error('   3. 2-Factor Authentication is enabled on Gmail');
//         console.error('   4. App password was generated correctly');
//       }
      
//       this.isConfigured = false;
//       return false;
//     }
//   }

//   // Ensure initialization is complete before testing
//   async ensureInitialized() {
//     if (this.initializationPromise) {
//       await this.initializationPromise;
//       this.initializationPromise = null; // Clear it after first use
//     }
//     return this.isConfigured;
//   }

//   // Test email configuration
//   async testConnection() {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       return { success: false, message: 'Email service not configured' };
//     }

//     try {
//       await this.transporter.verify();
//       console.log('✅ Email server connection verified');
//       return { success: true, message: 'Email server connection successful' };
//     } catch (error) {
//       console.error('❌ Email server connection failed:', error);
//       return { success: false, message: 'Email server connection failed', error: error.message };
//     }
//   }

//   // Enhanced send email method with better error handling
//   async sendEmail(mailOptions) {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       console.warn('⚠️ Email service not configured - email sending disabled');
//       return { success: false, simulated: true, message: 'Email service not configured' };
//     }

//     try {
//       const info = await this.transporter.sendMail(mailOptions);
//       console.log(`✅ Email sent successfully to ${mailOptions.to}`);
//       console.log(`📧 Message ID: ${info.messageId}`);
      
//       return { 
//         success: true, 
//         messageId: info.messageId,
//         accepted: info.accepted,
//         rejected: info.rejected
//       };
      
//     } catch (error) {
//       console.error('❌ Email send failed:', error);
      
//       let errorMessage = 'Failed to send email';
//       let errorCode = 'SEND_ERROR';
      
//       if (error.code === 'EMESSAGE') {
//         errorMessage = 'Invalid email content or format';
//         errorCode = 'INVALID_MESSAGE';
//       } else if (error.code === 'EAUTH') {
//         errorMessage = 'Email authentication failed';
//         errorCode = 'AUTH_ERROR';
//       } else if (error.responseCode === 550) {
//         errorMessage = 'Recipient email address rejected';
//         errorCode = 'RECIPIENT_REJECTED';
//       }
      
//       return { 
//         success: false, 
//         error: errorMessage,
//         code: errorCode,
//         details: error.message 
//       };
//     }
//   }

//   // Send verification email
//   async sendVerificationEmail(user, token) {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating verification email');
//       return { success: false, simulated: true };
//     }

//     const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
//     const fullName = `${user.firstName} ${user.lastName}`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: 'Verify Your Email Address - The Melissa NYC',
//       html: this.getVerificationEmailTemplate(fullName, user.username, verificationUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Verification email sent to:', user.email);
//     } else {
//       console.error('❌ Verification email failed for:', user.email);
//     }
    
//     return result;
//   }

//   // Send welcome email after verification
//   async sendWelcomeEmail(user) {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating welcome email');
//       return { success: false, simulated: true };
//     }

//     const fullName = `${user.firstName} ${user.lastName}`;
//     const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: '🎉 Email Verified Successfully - The Melissa NYC',
//       html: this.getWelcomeEmailTemplate(fullName, user.role, loginUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Welcome email sent to:', user.email);
//     }
    
//     return result;
//   }

//   // Send approval notification
//   async sendApprovalNotification(user) {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating approval email');
//       return { success: false, simulated: true };
//     }

//     const fullName = `${user.firstName} ${user.lastName}`;
//     const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: '🎉 Account Approved - Welcome to The Melissa NYC!',
//       html: this.getApprovalEmailTemplate(fullName, loginUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Approval email sent to:', user.email);
//     }
    
//     return result;
//   }

//   // Send rejection notification
//   async sendRejectionNotification(user, reason = 'Administrative decision') {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating rejection email');
//       return { success: false, simulated: true };
//     }

//     const fullName = `${user.firstName} ${user.lastName}`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: 'Account Registration Update - The Melissa NYC',
//       html: this.getRejectionEmailTemplate(fullName, reason)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Rejection email sent to:', user.email);
//     }
    
//     return result;
//   }

//   // Send notification to admins about new user pending approval
//   async sendNewUserNotification(adminEmail, newUser) {
//     // Wait for initialization to complete
//     await this.ensureInitialized();
    
//     if (!this.isConfigured) {
//       console.log('⚠️ Email service not configured - simulating admin notification');
//       return { success: false, simulated: true };
//     }

//     const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/users/pending`;
    
//     const mailOptions = {
//       from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
//       to: adminEmail,
//       subject: '🔔 New User Pending Approval - The Melissa NYC',
//       html: this.getAdminNotificationTemplate(newUser, dashboardUrl)
//     };

//     const result = await this.sendEmail(mailOptions);
    
//     if (result.success) {
//       console.log('✅ Admin notification sent to:', adminEmail);
//     }
    
//     return result;
//   }

//   // Enhanced verification email template with better styling
//   getVerificationEmailTemplate(fullName, username, verificationUrl) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Verify Your Email - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #2c3e50, #34495e); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .header h1 { 
//             margin: 0 0 10px 0; 
//             font-size: 28px; 
//             font-weight: 300;
//           }
//           .content { padding: 40px 30px; }
//           .content h2 { 
//             color: #2c3e50; 
//             margin-top: 0; 
//             font-size: 24px;
//           }
//           .button-container { 
//             text-align: center; 
//             margin: 30px 0; 
//           }
//           .verify-button { 
//             display: inline-block; 
//             background: #3498db; 
//             color: white !important; 
//             padding: 15px 30px; 
//             text-decoration: none; 
//             border-radius: 6px; 
//             font-weight: bold; 
//             font-size: 16px;
//             transition: background-color 0.3s ease;
//           }
//           .verify-button:hover { 
//             background: #2980b9; 
//           }
//           .warning { 
//             background: #fff8e1; 
//             border-left: 4px solid #ffa726; 
//             padding: 15px 20px; 
//             margin: 25px 0; 
//             border-radius: 4px;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//           .link-fallback { 
//             background: #f8f9fa; 
//             padding: 15px; 
//             border-radius: 4px; 
//             margin: 20px 0; 
//             word-break: break-all;
//             font-family: 'Courier New', monospace;
//             font-size: 12px;
//             color: #555;
//           }
//           @media only screen and (max-width: 600px) {
//             .email-container { margin: 10px; }
//             .header, .content { padding: 25px 20px; }
//             .header h1 { font-size: 24px; }
//             .verify-button { padding: 12px 25px; font-size: 14px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🏢 The Melissa NYC</h1>
//             <p>Luxury Property Management</p>
//           </div>
          
//           <div class="content">
//             <h2>Welcome, ${fullName}!</h2>
//             <p>Your admin account (<strong>@${username}</strong>) has been created for The Melissa NYC property management system. Please verify your email address to complete the registration process.</p>
            
//             <div class="button-container">
//               <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
//             </div>
            
//             <div class="warning">
//               <strong>⏰ Important:</strong> This verification link will expire in 24 hours. Please verify your email as soon as possible.
//             </div>
            
//             <p><strong>Next Steps:</strong></p>
//             <ol>
//               <li>Click the verification button above</li>
//               <li>Wait for admin approval (you'll get another email)</li>
//               <li>Login and start managing properties</li>
//             </ol>
            
//             <p>If you didn't create this account, please ignore this email.</p>
            
//             <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
//             <p><strong>Having trouble with the button?</strong> Copy and paste this link:</p>
//             <div class="link-fallback">${verificationUrl}</div>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//             <p>This is an automated message, please do not reply.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getWelcomeEmailTemplate(fullName, role, loginUrl) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Email Verified - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #27ae60, #2ecc71); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; }
//           .success-badge { 
//             background: #d4edda; 
//             color: #155724; 
//             padding: 20px; 
//             border-radius: 6px; 
//             text-align: center; 
//             margin: 25px 0; 
//             border: 1px solid #c3e6cb;
//           }
//           .info-box { 
//             background: #f8f9fa; 
//             padding: 20px; 
//             border-radius: 6px; 
//             margin: 25px 0; 
//             border-left: 4px solid #007bff;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//           @media only screen and (max-width: 600px) {
//             .email-container { margin: 10px; }
//             .header, .content { padding: 25px 20px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🎉 Email Verified!</h1>
//             <p>The Melissa NYC</p>
//           </div>
          
//           <div class="content">
//             <div class="success-badge">
//               <h3 style="margin: 0 0 10px 0;">✅ Email Verification Complete!</h3>
//               <p style="margin: 0;">Your account is now pending admin approval.</p>
//             </div>
            
//             <h2>Hello ${fullName},</h2>
//             <p>Great! Your email has been successfully verified. Your account is now pending approval from our administrators.</p>
            
//             <div class="info-box">
//               <h3 style="margin-top: 0;">Account Details:</h3>
//               <ul style="margin: 10px 0;">
//                 <li><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</li>
//                 <li><strong>Status:</strong> ✅ Email Verified, ⏳ Pending Approval</li>
//               </ul>
//             </div>
            
//             <h3>What happens next?</h3>
//             <ol>
//               <li>Our admin team will review your account within 24-48 hours</li>
//               <li>You'll receive an email notification once approved</li>
//               <li>After approval, you can login and access the system</li>
//             </ol>
            
//             <p>You'll receive another email once your account has been approved and activated.</p>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getApprovalEmailTemplate(fullName, loginUrl) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Account Approved - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #28a745, #20c997); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; text-align: center; }
//           .login-button { 
//             display: inline-block; 
//             background: #28a745; 
//             color: white !important; 
//             padding: 15px 30px; 
//             text-decoration: none; 
//             border-radius: 6px; 
//             font-weight: bold; 
//             font-size: 16px;
//             margin: 20px 0;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🎉 Account Approved!</h1>
//             <p>Welcome to The Melissa NYC</p>
//           </div>
          
//           <div class="content">
//             <h2>Welcome Aboard, ${fullName}!</h2>
//             <p>Great news! Your admin account has been approved and is now active. You can now access the property management system and begin managing units, contacts, and gallery content.</p>
            
//             <div style="margin: 35px 0;">
//               <a href="${loginUrl}" class="login-button">Login to Dashboard</a>
//             </div>
            
//             <p>If you have any questions, please don't hesitate to contact our support team.</p>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getRejectionEmailTemplate(fullName, reason) {
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Registration Update - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #6c757d, #495057); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; }
//           .reason-box { 
//             background: #fff3cd; 
//             padding: 15px; 
//             border-radius: 6px; 
//             margin: 20px 0; 
//             border-left: 4px solid #ffc107;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>Registration Update</h1>
//             <p>The Melissa NYC</p>
//           </div>
          
//           <div class="content">
//             <h2>Dear ${fullName},</h2>
//             <p>Thank you for your interest in joining The Melissa NYC property management team. After careful review, we are unable to approve your account registration at this time.</p>
            
//             ${reason !== 'Administrative decision' ? `
//             <div class="reason-box">
//               <p style="color: #856404; margin: 0; font-weight: 500;"><strong>Reason:</strong> ${reason}</p>
//             </div>
//             ` : ''}
            
//             <p>If you believe this was an error or would like to discuss your application further, please contact our administrator directly.</p>
//             <p>Thank you for your understanding.</p>
//           </div>
          
//           <div class="footer">
//             <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }

//   getAdminNotificationTemplate(newUser, dashboardUrl) {
//     const fullName = `${newUser.firstName} ${newUser.lastName}`;
    
//     return `
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>New User Pending Approval - The Melissa NYC</title>
//         <style>
//           body { 
//             margin: 0; 
//             padding: 0; 
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//             line-height: 1.6; 
//             color: #333; 
//             background-color: #f4f4f4;
//           }
//           .email-container { 
//             max-width: 600px; 
//             margin: 20px auto; 
//             background: white;
//             border-radius: 10px;
//             overflow: hidden;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//           }
//           .header { 
//             background: linear-gradient(135deg, #17a2b8, #138496); 
//             color: white; 
//             padding: 40px 30px; 
//             text-align: center; 
//           }
//           .content { padding: 40px 30px; }
//           .user-info { 
//             background: #f8f9fa; 
//             padding: 20px; 
//             border-radius: 8px; 
//             margin: 25px 0; 
//             border-left: 4px solid #17a2b8;
//           }
//           .review-button { 
//             display: inline-block; 
//             background: #17a2b8; 
//             color: white !important; 
//             padding: 15px 30px; 
//             text-decoration: none; 
//             border-radius: 6px; 
//             font-weight: bold; 
//             font-size: 16px;
//             margin: 20px 0;
//           }
//           .footer { 
//             background: #f8f9fa; 
//             padding: 30px; 
//             text-align: center; 
//             font-size: 14px; 
//             color: #666; 
//             border-top: 1px solid #eee;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="email-container">
//           <div class="header">
//             <h1>🔔 New User Pending Approval</h1>
//             <p>The Melissa NYC Admin Notification</p>
//           </div>
          
//           <div class="content">
//             <h2>New User Awaiting Approval</h2>
//             <p>A new user has completed email verification and is awaiting approval:</p>
            
//             <div class="user-info">
//               <div style="display: grid; gap: 8px;">
//                 <p style="margin: 0; color: #333;"><strong>Name:</strong> ${fullName}</p>
//                 <p style="margin: 0; color: #333;"><strong>Username:</strong> @${newUser.username}</p>
//                 <p style="margin: 0; color: #333;"><strong>Email:</strong> ${newUser.email}</p>
//                 <p style="margin: 0; color: #333;"><strong>Role:</strong> ${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}</p>
//                 <p style="margin: 0; color: #333;"><strong>Registration:</strong> ${newUser.createdAt ? newUser.createdAt.toLocaleDateString() : 'Recently'}</p>
//               </div>
//             </div>
            
//             <div style="text-align: center; margin: 35px 0;">
//               <a href="${dashboardUrl}" class="review-button">Review Application →</a>
//             </div>
            
//             <p>Please review the application and either approve or reject the user account from the admin dashboard.</p>
//           </div>
          
//           <div class="footer">
//             <p>This is an automated notification from The Melissa NYC property management system.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   }
// }

// module.exports = new EmailService();

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializationPromise = this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Updated: Use Gmail App Password configuration that we tested
      if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        console.log('⚠️ Email service not configured - missing EMAIL_USER or EMAIL_APP_PASSWORD');
        console.log('Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env file');
        this.isConfigured = false;
        return;
      }

      console.log('🔄 Initializing Gmail SMTP connection...');

      // Gmail SMTP configuration with App Password (tested and working)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD // Updated to use app password
        },
        pool: true, // Use connection pooling for better performance
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 20000, // 20 seconds
        rateLimit: 5, // Max 5 emails per rate delta
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2'
        }
      });

      // Verify the connection
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('✅ The Melissa NYC email service configured successfully with Gmail SMTP');
      
    } catch (error) {
      console.error('❌ Email service configuration failed:', error);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        console.error('🔐 Gmail authentication failed. Please check:');
        console.error('   1. EMAIL_USER is your correct Gmail address');
        console.error('   2. EMAIL_APP_PASSWORD is the 16-character app password');
        console.error('   3. 2-Factor Authentication is enabled on Gmail');
        console.error('   4. App password was generated correctly');
      } else if (error.code === 'ECONNECTION') {
        console.error('🌐 Connection failed. Please check:');
        console.error('   1. Internet connection is working');
        console.error('   2. Firewall allows port 587');
        console.error('   3. No antivirus blocking email connections');
      }
      
      this.isConfigured = false;
      this.transporter = null;
    }
  }

  // Ensure service is ready before operations
  async ensureReady() {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    return this.isConfigured;
  }

  // Test email configuration
  async testConnection() {
    await this.ensureReady();
    
    if (!this.isConfigured || !this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified');
      return { success: true, message: 'Email server connection successful' };
    } catch (error) {
      console.error('❌ Email server connection failed:', error);
      return { success: false, message: 'Email server connection failed', error: error.message };
    }
  }

  // Enhanced send email method with better error handling
  async sendEmail(mailOptions) {
    await this.ensureReady();
    
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured - email sending disabled');
      return { success: false, simulated: true, message: 'Email service not configured' };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${mailOptions.to}`);
      console.log(`📧 Message ID: ${info.messageId}`);
      
      return { 
        success: true, 
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      };
      
    } catch (error) {
      console.error('❌ Email send failed:', error);
      
      let errorMessage = 'Failed to send email';
      let errorCode = 'SEND_ERROR';
      
      if (error.code === 'EMESSAGE') {
        errorMessage = 'Invalid email content or format';
        errorCode = 'INVALID_MESSAGE';
      } else if (error.code === 'EAUTH') {
        errorMessage = 'Email authentication failed';
        errorCode = 'AUTH_ERROR';
      } else if (error.responseCode === 550) {
        errorMessage = 'Recipient email address rejected';
        errorCode = 'RECIPIENT_REJECTED';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode,
        details: error.message 
      };
    }
  }

  // Send verification email
  async sendVerificationEmail(user, token) {
    await this.ensureReady();
    
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured - simulating verification email');
      return { success: false, simulated: true };
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    const fullName = `${user.firstName} ${user.lastName}`;
    
    const mailOptions = {
      from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verify Your Email Address - The Melissa NYC',
      html: this.getVerificationEmailTemplate(fullName, user.username, verificationUrl)
    };

    const result = await this.sendEmail(mailOptions);
    
    if (result.success) {
      console.log('✅ Verification email sent to:', user.email);
    } else if (!result.simulated) {
      console.error('❌ Verification email failed for:', user.email);
    }
    
    return result;
  }

  // Send welcome email after verification
  async sendWelcomeEmail(user) {
    await this.ensureReady();
    
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured - simulating welcome email');
      return { success: false, simulated: true };
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
    const mailOptions = {
      from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Email Verified Successfully - The Melissa NYC',
      html: this.getWelcomeEmailTemplate(fullName, user.role, loginUrl)
    };

    const result = await this.sendEmail(mailOptions);
    
    if (result.success) {
      console.log('✅ Welcome email sent to:', user.email);
    }
    
    return result;
  }

  // Send approval notification
  async sendApprovalNotification(user) {
    await this.ensureReady();
    
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured - simulating approval email');
      return { success: false, simulated: true };
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
    const mailOptions = {
      from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎉 Account Approved - Welcome to The Melissa NYC!',
      html: this.getApprovalEmailTemplate(fullName, loginUrl)
    };

    const result = await this.sendEmail(mailOptions);
    
    if (result.success) {
      console.log('✅ Approval email sent to:', user.email);
    }
    
    return result;
  }

  // Send rejection notification
  async sendRejectionNotification(user, reason = 'Administrative decision') {
    await this.ensureReady();
    
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured - simulating rejection email');
      return { success: false, simulated: true };
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    
    const mailOptions = {
      from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Account Registration Update - The Melissa NYC',
      html: this.getRejectionEmailTemplate(fullName, reason)
    };

    const result = await this.sendEmail(mailOptions);
    
    if (result.success) {
      console.log('✅ Rejection email sent to:', user.email);
    }
    
    return result;
  }

  // Send notification to admins about new user pending approval
  async sendNewUserNotification(adminEmail, newUser) {
    await this.ensureReady();
    
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured - simulating admin notification');
      return { success: false, simulated: true };
    }

    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/users/pending`;
    
    const mailOptions = {
      from: `"The Melissa NYC" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: '🔔 New User Pending Approval - The Melissa NYC',
      html: this.getAdminNotificationTemplate(newUser, dashboardUrl)
    };

    const result = await this.sendEmail(mailOptions);
    
    if (result.success) {
      console.log('✅ Admin notification sent to:', adminEmail);
    }
    
    return result;
  }

  // Enhanced verification email template with better styling
  getVerificationEmailTemplate(fullName, username, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - The Melissa NYC</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2c3e50, #34495e); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 300;
          }
          .content { padding: 40px 30px; }
          .content h2 { 
            color: #2c3e50; 
            margin-top: 0; 
            font-size: 24px;
          }
          .button-container { 
            text-align: center; 
            margin: 30px 0; 
          }
          .verify-button { 
            display: inline-block; 
            background: #3498db; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            font-size: 16px;
            transition: background-color 0.3s ease;
          }
          .verify-button:hover { 
            background: #2980b9; 
          }
          .warning { 
            background: #fff8e1; 
            border-left: 4px solid #ffa726; 
            padding: 15px 20px; 
            margin: 25px 0; 
            border-radius: 4px;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #eee;
          }
          .link-fallback { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 20px 0; 
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #555;
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 10px; }
            .header, .content { padding: 25px 20px; }
            .header h1 { font-size: 24px; }
            .verify-button { padding: 12px 25px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🏢 The Melissa NYC</h1>
            <p>Luxury Property Management</p>
          </div>
          
          <div class="content">
            <h2>Welcome, ${fullName}!</h2>
            <p>Your admin account (<strong>@${username}</strong>) has been created for The Melissa NYC property management system. Please verify your email address to complete the registration process.</p>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
            </div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This verification link will expire in 24 hours. Please verify your email as soon as possible.
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Click the verification button above</li>
              <li>Wait for admin approval (you'll get another email)</li>
              <li>Login and start managing properties</li>
            </ol>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p><strong>Having trouble with the button?</strong> Copy and paste this link:</p>
            <div class="link-fallback">${verificationUrl}</div>
          </div>
          
          <div class="footer">
            <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(fullName, role, loginUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified - The Melissa NYC</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #27ae60, #2ecc71); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .content { padding: 40px 30px; }
          .success-badge { 
            background: #d4edda; 
            color: #155724; 
            padding: 20px; 
            border-radius: 6px; 
            text-align: center; 
            margin: 25px 0; 
            border: 1px solid #c3e6cb;
          }
          .info-box { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 25px 0; 
            border-left: 4px solid #007bff;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #eee;
          }
          @media only screen and (max-width: 600px) {
            .email-container { margin: 10px; }
            .header, .content { padding: 25px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 Email Verified!</h1>
            <p>The Melissa NYC</p>
          </div>
          
          <div class="content">
            <div class="success-badge">
              <h3 style="margin: 0 0 10px 0;">✅ Email Verification Complete!</h3>
              <p style="margin: 0;">Your account is now pending admin approval.</p>
            </div>
            
            <h2>Hello ${fullName},</h2>
            <p>Great! Your email has been successfully verified. Your account is now pending approval from our administrators.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">Account Details:</h3>
              <ul style="margin: 10px 0;">
                <li><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</li>
                <li><strong>Status:</strong> ✅ Email Verified, ⏳ Pending Approval</li>
              </ul>
            </div>
            
            <h3>What happens next?</h3>
            <ol>
              <li>Our admin team will review your account within 24-48 hours</li>
              <li>You'll receive an email notification once approved</li>
              <li>After approval, you can login and access the system</li>
            </ol>
            
            <p>You'll receive another email once your account has been approved and activated.</p>
          </div>
          
          <div class="footer">
            <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getApprovalEmailTemplate(fullName, loginUrl) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved - The Melissa NYC</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #28a745, #20c997); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .content { padding: 40px 30px; text-align: center; }
          .login-button { 
            display: inline-block; 
            background: #28a745; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            font-size: 16px;
            margin: 20px 0;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 Account Approved!</h1>
            <p>Welcome to The Melissa NYC</p>
          </div>
          
          <div class="content">
            <h2>Welcome Aboard, ${fullName}!</h2>
            <p>Great news! Your admin account has been approved and is now active. You can now access the property management system and begin managing units, contacts, and gallery content.</p>
            
            <div style="margin: 35px 0;">
              <a href="${loginUrl}" class="login-button">Login to Dashboard</a>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
          
          <div class="footer">
            <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getRejectionEmailTemplate(fullName, reason) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Update - The Melissa NYC</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #6c757d, #495057); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .content { padding: 40px 30px; }
          .reason-box { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 4px solid #ffc107;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Registration Update</h1>
            <p>The Melissa NYC</p>
          </div>
          
          <div class="content">
            <h2>Dear ${fullName},</h2>
            <p>Thank you for your interest in joining The Melissa NYC property management team. After careful review, we are unable to approve your account registration at this time.</p>
            
            ${reason !== 'Administrative decision' ? `
            <div class="reason-box">
              <p style="color: #856404; margin: 0; font-weight: 500;"><strong>Reason:</strong> ${reason}</p>
            </div>
            ` : ''}
            
            <p>If you believe this was an error or would like to discuss your application further, please contact our administrator directly.</p>
            <p>Thank you for your understanding.</p>
          </div>
          
          <div class="footer">
            <p><strong>The Melissa NYC</strong><br>© 2025 All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAdminNotificationTemplate(newUser, dashboardUrl) {
    const fullName = `${newUser.firstName} ${newUser.lastName}`;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Pending Approval - The Melissa NYC</title>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
          }
          .email-container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #17a2b8, #138496); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .content { padding: 40px 30px; }
          .user-info { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 25px 0; 
            border-left: 4px solid #17a2b8;
          }
          .review-button { 
            display: inline-block; 
            background: #17a2b8; 
            color: white !important; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold; 
            font-size: 16px;
            margin: 20px 0;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🔔 New User Pending Approval</h1>
            <p>The Melissa NYC Admin Notification</p>
          </div>
          
          <div class="content">
            <h2>New User Awaiting Approval</h2>
            <p>A new user has completed email verification and is awaiting approval:</p>
            
            <div class="user-info">
              <div style="display: grid; gap: 8px;">
                <p style="margin: 0; color: #333;"><strong>Name:</strong> ${fullName}</p>
                <p style="margin: 0; color: #333;"><strong>Username:</strong> @${newUser.username}</p>
                <p style="margin: 0; color: #333;"><strong>Email:</strong> ${newUser.email}</p>
                <p style="margin: 0; color: #333;"><strong>Role:</strong> ${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}</p>
                <p style="margin: 0; color: #333;"><strong>Registration:</strong> ${newUser.createdAt ? newUser.createdAt.toLocaleDateString() : 'Recently'}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${dashboardUrl}" class="review-button">Review Application →</a>
            </div>
            
            <p>Please review the application and either approve or reject the user account from the admin dashboard.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from The Melissa NYC property management system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();