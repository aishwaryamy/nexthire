import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def send_job_alert_email(to_email: str, jobs: list, query_used: str) -> bool:
    """Send an email digest of newly discovered job matches."""
    if not settings.SMTP_EMAIL or not settings.SMTP_PASSWORD:
        return False

    subject = f"NextHire: {len(jobs)} new matching roles found"

    # Build HTML email
    job_rows = ""
    for job in jobs[:10]:  # Top 10 only
        score_color = "#10b981" if job.get("score", 0) >= 80 else \
                      "#f59e0b" if job.get("score", 0) >= 60 else "#ef4444"
        priority = job.get("apply_priority", "medium").upper()
        job_rows += f"""
        <tr style="border-bottom: 1px solid #2e2e3e;">
          <td style="padding: 12px 8px;">
            <strong style="color: #e8e8f0;">{job.get('company', 'Unknown')}</strong><br>
            <span style="color: #9090a8; font-size: 13px;">{job.get('role', '')}</span>
          </td>
          <td style="padding: 12px 8px; text-align: center;">
            <span style="color: {score_color}; font-weight: bold; font-size: 16px;">
              {job.get('score', 0)}
            </span>
          </td>
          <td style="padding: 12px 8px;">
            <span style="color: #9090a8; font-size: 12px;">{priority}</span>
          </td>
          <td style="padding: 12px 8px;">
            {"<a href='" + job['url'] + "' style='color: #8b5cf6;'>View →</a>"
             if job.get('url') and job['url'] != '#' else "—"}
          </td>
        </tr>"""

    html = f"""
<!DOCTYPE html>
<html>
<body style="background: #0f0f13; color: #e8e8f0; font-family: Inter, sans-serif; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="margin-bottom: 24px;">
      <h1 style="color: #e8e8f0; font-size: 22px; margin: 0;">⚡ NextHire</h1>
      <p style="color: #9090a8; margin: 4px 0 0;">New matching roles found</p>
    </div>

    <div style="background: #18181f; border: 1px solid #2e2e3e; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
      <p style="color: #e8e8f0; margin: 0 0 8px;">
        Found <strong style="color: #8b5cf6;">{len(jobs)} new roles</strong> matching your success profile.
      </p>
      <p style="color: #9090a8; font-size: 13px; margin: 0;">Search: <em>{query_used}</em></p>
    </div>

    <table style="width: 100%; border-collapse: collapse; background: #18181f;
                  border: 1px solid #2e2e3e; border-radius: 10px; overflow: hidden;">
      <thead>
        <tr style="background: #222230;">
          <th style="padding: 10px 8px; text-align: left; color: #9090a8; font-size: 11px; text-transform: uppercase;">Company / Role</th>
          <th style="padding: 10px 8px; text-align: center; color: #9090a8; font-size: 11px; text-transform: uppercase;">Score</th>
          <th style="padding: 10px 8px; color: #9090a8; font-size: 11px; text-transform: uppercase;">Priority</th>
          <th style="padding: 10px 8px; color: #9090a8; font-size: 11px; text-transform: uppercase;">Link</th>
        </tr>
      </thead>
      <tbody>{job_rows}</tbody>
    </table>

    <div style="margin-top: 24px; text-align: center;">
      <a href="{settings.APP_URL}/discover"
         style="background: #8b5cf6; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: 600;">
        Open NextHire →
      </a>
    </div>

    <p style="color: #5c5c78; font-size: 11px; margin-top: 24px; text-align: center;">
      NextHire AI · You're receiving this because you have job alerts enabled.
    </p>
  </div>
</body>
</html>"""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = settings.SMTP_EMAIL
        msg["To"]      = to_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[email] Failed to send: {e}")
        return False
