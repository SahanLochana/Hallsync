from app.core.config import settings
import resend


class EmailService:
    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
        self.from_email = "HallSync <noreply@hallsync.tech>"

    def send_welcome_email(
        self,
        to_email: str,
        name: str,
        username: str,
        password: str,
        app_download_link: str = "https://hallsync.tech/download",
    ) -> bool:
        """Send welcome email with login credentials and mobile app download link."""
        try:
            resend.Emails.send(
                {
                    "from": self.from_email,
                    "to": to_email,
                    "subject": "Welcome to HallSync - Your Account Credentials",
                    "html": (
                        f"<!DOCTYPE html>"
                        f"<html>"
                        f"<head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>"
                        f"<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;'>"
                        f"<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color: #f8fafc; padding: 30px 10px;'>"
                        f"<tr><td align='center'>"
                        f"<table role='presentation' width='100%' style='max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;' cellspacing='0' cellpadding='0'>"
                        # Header
                        f"<tr><td style='background: linear-gradient(135deg, #1e3b8a 0%, #1e40af 100%); padding: 32px 28px; text-align: center;'>"
                        f"<h1 style='margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;'>HallSync</h1>"
                        f"<p style='margin: 6px 0 0 0; color: #93c5fd; font-size: 14px;'>Smart Hall & Timetable Management</p>"
                        f"</td></tr>"
                        # Main Body
                        f"<tr><td style='padding: 32px 28px;'>"
                        f"<h2 style='margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 600;'>Welcome to HallSync, {name}!</h2>"
                        f"<p style='margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;'>"
                        f"Your account has been successfully created. You can now log in to the HallSync mobile application to check lecture schedules, venue allocations, and real-time updates."
                        f"</p>"
                        # Credentials Box
                        f"<div style='background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;'>"
                        f"<div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px;'>Your Login Credentials</div>"
                        f"<table width='100%' cellspacing='0' cellpadding='4'>"
                        f"<tr>"
                        f"<td style='color: #64748b; font-size: 13px; font-weight: 600; width: 90px;'>Username:</td>"
                        f"<td style='color: #0f172a; font-size: 14px; font-weight: 700; font-family: monospace;'>{username}</td>"
                        f"</tr>"
                        f"<tr>"
                        f"<td style='color: #64748b; font-size: 13px; font-weight: 600;'>Password:</td>"
                        f"<td style='color: #1e3b8a; font-size: 18px; font-weight: 700; font-family: monospace; letter-spacing: 2px;'>{password}</td>"
                        f"</tr>"
                        f"</table>"
                        f"</div>"
                        # Security Notice
                        f"<p style='margin: 0 0 28px 0; color: #64748b; font-size: 13px; line-height: 1.5;'>"
                        f"⚠️ <strong>Important:</strong> For security reasons, you will be prompted to change this temporary password upon your first login."
                        f"</p>"
                        # Download Button
                        f"<div style='text-align: center; margin: 30px 0;'>"
                        f"<a href='{app_download_link}' target='_blank' style='display: inline-block; background-color: #1e3b8a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(30, 59, 138, 0.25);'>"
                        f"📲 Download HallSync Mobile App"
                        f"</a>"
                        f"</div>"
                        f"<p style='text-align: center; margin: 0; color: #94a3b8; font-size: 12px;'>Or visit: <a href='{app_download_link}' style='color: #1e3b8a; text-decoration: underline;'>{app_download_link}</a></p>"
                        f"</td></tr>"
                        # Footer
                        f"<tr><td style='background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center;'>"
                        f"<p style='margin: 0; color: #94a3b8; font-size: 12px;'>This is an automated email from HallSync. Please do not reply directly to this message.</p>"
                        f"<p style='margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;'>© 2026 HallSync. All rights reserved.</p>"
                        f"</td></tr>"
                        f"</table>"
                        f"</td></tr>"
                        f"</table>"
                        f"</body>"
                        f"</html>"
                    ),
                }
            )
            return True
        except Exception as e:
            print(f"Failed to send welcome email to {to_email}: {e}")
            return False

    def send_otp(self, to_email: str, name: str, otp: str) -> bool:
        """Send OTP code to user email via Resend."""
        try:
            resend.Emails.send(
                {
                    "from": self.from_email,
                    "to": to_email,
                    "subject": "HallSync - Password Reset OTP",
                    "html": (
                        f"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>"
                        f"<h2 style='color: #1e3b8a;'>Password Reset Request</h2>"
                        f"<p>Hi <strong>{name}</strong>,</p>"
                        f"<p>You requested to reset your password for HallSync. Use the OTP code below to proceed:</p>"
                        f"<div style='background-color: #f4f6f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;'>"
                        f"<span style='font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #111;'>{otp}</span>"
                        f"</div>"
                        f"<p>This code will expire in <strong>10 minutes</strong>.</p>"
                        f"<p style='color: #777; font-size: 12px;'>If you did not request a password reset, please ignore this email.</p>"
                        f"<hr style='border: none; border-top: 1px solid #eee; margin-top: 20px;' />"
                        f"<p style='color: #999; font-size: 12px;'>— HallSync Team</p>"
                        f"</div>"
                    ),
                }
            )
            return True
        except Exception as e:
            print(f"Failed to send OTP email to {to_email}: {e}")
            return False
