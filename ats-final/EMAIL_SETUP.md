# 📧 Email Setup Guide — TechHire ATS

## Your Credentials (Already Configured)

```
EMAIL_USER = f223863@cfd.nu.edu.pk
EMAIL_PASS = bmdzvtbicsomkuve
```

These are already set in `backend/.env`. No changes needed.

## How Email Works in This System

### Automatic Emails (sent without clicking anything):
| Action | Email Sent To |
|--------|--------------|
| Candidate status → **Shortlisted** | Candidate gets congratulations email |
| Candidate status → **Rejected** | Candidate gets polite rejection email |
| **New Interview Scheduled** | Candidate gets interview invitation with date/time/link |

### Manual Email Buttons:
| Button | What it does |
|--------|-------------|
| 📨 Shortlist Email | Manually resend shortlist email |
| 📨 Reject Email | Manually resend rejection email |
| ✉️ Custom Message | Write any custom message |
| 📧 (in interview card) | Resend interview email |

## Troubleshooting

If emails fail, check:
1. Gmail account is active and accessible
2. App Password is correct (no spaces): `bmdzvtbicsomkuve`
3. Backend server is running and connected to internet
4. Check server console for `✅ email sent` or `❌ error` messages

## Email Templates

All emails are sent as branded HTML emails with:
- TechHire ATS header
- Relevant emoji and color coding
- Professional formatting
- Automatic footer

