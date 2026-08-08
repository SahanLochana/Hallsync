from app.core.config import settings
import resend


class EmailService:
    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY

    def send_otp(self, to_email: str, name: str, otp: str) -> bool:
        """Send OTP code to user email via Resend."""
        try:
            resend.Emails.send(
                {
                    "from": "HallSync <onboarding@resend.dev>",
                    "to": "hallsync.project@gmail.com",
                    "subject": "HallSync - Password Reset OTP",
                    "html": (
                        f"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>"
                        f"<h2 style='color: #4A90E2;'>Password Reset Request</h2>"
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
