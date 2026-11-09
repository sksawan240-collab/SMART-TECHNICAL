"""
Responsive HTML Email Templates for Smart Technical Support University
Designed with rich CSS gradients, university branding, and email client compatibility.
"""

def get_otp_email_html(full_name: str, otp_code: str, valid_minutes: int = 5) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your University Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SMART TECHNICAL SUPPORT UNIVERSITY</h1>
              <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Secure Account Authentication</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 20px; font-weight: 700;">Hello {full_name},</h2>
              <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                Thank you for registering with the <strong>Smart Technical Support University Management System</strong>. Please use the verification code below to verify your university email and activate your account:
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <div style="background: #1e293b; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px 32px; display: inline-block;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #38bdf8; letter-spacing: 10px;">{otp_code}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 14px;">
                ⏰ This code will expire in <strong>{valid_minutes} minutes</strong>. For security reasons, never share this OTP with anyone, including university IT personnel.
              </p>
              
              <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-top: 24px;">
                <p style="margin: 0; color: #93c5fd; font-size: 13px;">
                  Did not request this code? You can safely disregard this email or report it to security@stsu.edu.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background: #0f172a; padding: 20px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 Smart Technical Support University. All rights reserved.</p>
              <p style="margin: 4px 0 0 0; color: #475569; font-size: 11px;">Central IT Division • Secure Campus Operations</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def get_welcome_ticket_email_html(full_name: str, email: str, role: str, ticket_id: str, department: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Smart Technical Support University</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%); padding: 36px 32px; text-align: center;">
              <span style="background: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Account Activated</span>
              <h1 style="margin: 12px 0 0 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to STSU Technical Platform</h1>
              <p style="margin: 8px 0 0 0; color: #f0fdf4; font-size: 14px;">Next-Generation Intelligent Campus Support</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 14px 0; color: #ffffff; font-size: 20px; font-weight: 700;">Welcome aboard, {full_name}!</h2>
              <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                We are delighted to welcome you to our university's intelligent technical support platform. Your account has been successfully verified and activated.
              </p>
              
              <!-- Ticket Card -->
              <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
                  <span style="color: #10b981; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">🎫 Automated Onboarding Ticket</span>
                  <span style="color: #60a5fa; font-family: monospace; font-weight: 700; font-size: 15px;">{ticket_id}</span>
                </div>
                <table width="100%" cellspacing="0" cellpadding="4" style="color: #cbd5e1; font-size: 14px;">
                  <tr>
                    <td style="color: #94a3b8; width: 40%;">Category:</td>
                    <td style="font-weight: 600; color: #f8fafc;">Account Access & Onboarding</td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8;">Status:</td>
                    <td><span style="background: #065f46; color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">OPEN</span></td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8;">Registered Role:</td>
                    <td style="font-weight: 600; color: #60a5fa;">{role}</td>
                  </tr>
                  <tr>
                    <td style="color: #94a3b8;">Department:</td>
                    <td style="font-weight: 600; color: #f8fafc;">{department}</td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Our Central IT team has been automatically assigned to ensure your laboratory access, campus Wi-Fi (STSU-Secure), university LMS credentials, and specialized academic software are provisioned without delay.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:3000/login" style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">Access Your Dashboard</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 13px; text-align: center;">
                Need urgent technical assistance? Contact 24/7 Campus IT at <strong>support@stsu.edu</strong> or extension <strong>4400</strong>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background: #0f172a; padding: 20px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">© 2026 Smart Technical Support University. All rights reserved.</p>
              <p style="margin: 4px 0 0 0; color: #475569; font-size: 11px;">Central IT Operations • Department of Technology & Academic Computing</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
