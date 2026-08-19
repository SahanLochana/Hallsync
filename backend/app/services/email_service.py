from typing import List
from app.core.config import settings
import resend


class EmailService:
    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
        self.from_email = "HallSync <noreply@hallsync.tech>"
        self.welcome_template_id = "cf2f89b4-3953-4cd5-8055-74b3b3251292"
        self.otp_template_id = "be495f83-6445-488e-a886-687c62b04607"

    def send_welcome_email(
        self,
        to_email: str,
        name: str,
        username: str,
        password: str,
        app_download_link: str = "https://hallsync.tech/download",
    ) -> bool:
        try:
            resend.Emails.send(
                {
                    "from": self.from_email,
                    "to": to_email,
                    "subject": "Welcome to HallSync - Your Account Credentials",
                    "template": {
                        "id": self.welcome_template_id,
                        "variables": {
                            "name": name,
                            "username": username,
                            "pw": password,
                            "password": password,
                            "app_download_link": app_download_link,
                            "email": to_email,
                            "uni_mail": username,
                            "download_link": app_download_link,
                        },
                    },
                }
            )
            return True
        except Exception as e:
            print(f"Failed to send welcome email to {to_email}: {e}")
            return False

    def send_bulk_welcome_emails(
        self,
        users_data: List[dict],
        app_download_link: str = "https://hallsync.tech/download",
    ) -> bool:
        """
        Send batch welcome emails using Resend template and resend.Batch.send.
        Expects users_data = [{'to_email': str, 'name': str, 'username': str, 'password': str}, ...]
        Chunks requests in batches of up to 100 as per Resend API limits.
        """
        if not users_data:
            return True

        params: List[resend.Emails.SendParams] = [
            {
                "from": self.from_email,
                "to": [u["to_email"]],
                "subject": "Welcome to HallSync - Your Account Credentials",
                "template": {
                    "id": self.welcome_template_id,
                    "variables": {
                        "name": u.get("name", "User"),
                        "username": u["username"],
                        "pw": u["password"],
                        "password": u["password"],
                        "app_download_link": app_download_link,
                        "email": u["to_email"],
                        "uni_mail": u["username"],
                        "download_link": app_download_link,
                    },
                },
            }
            for u in users_data
            if u.get("to_email") and u.get("password")
        ]

        if not params:
            return True

        # Resend batch API limit is 100 emails per request
        batch_size = 100
        all_success = True

        for i in range(0, len(params), batch_size):
            chunk = params[i : i + batch_size]
            try:
                resend.Batch.send(chunk)
            except Exception as e:
                print(
                    f"Failed to send batch welcome emails (chunk {i // batch_size + 1}): {e}"
                )
                all_success = False

        return all_success

    def send_otp(self, to_email: str, name: str, otp: str) -> bool:
        """Send OTP code to user email via Resend template."""
        try:
            resend.Emails.send(
                {
                    "from": self.from_email,
                    "to": to_email,
                    "subject": "HallSync - Password Reset OTP",
                    "template": {
                        "id": self.otp_template_id,
                        "variables": {
                            "name": name,
                            "otp": otp,
                            "otp_code": otp,
                            "code": otp,
                            "email": to_email,
                        },
                    },
                }
            )
            return True
        except Exception as e:
            print(f"Failed to send OTP email to {to_email}: {e}")
            return False
