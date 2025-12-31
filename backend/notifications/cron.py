# Cron job logic for membership expiry reminders
# This function will be referenced in settings.py CRONJOBS
from members.models import Member
from django.utils import timezone

def send_membership_reminders():
    today = timezone.now().date()
    soon = today + timezone.timedelta(days=7)
    members = Member.objects.filter(status='active', end_date__range=[today, soon])
    for member in members:
        days_left = (member.end_date - today).days
        if days_left in [5, 1, 0]:
            # TODO: Integrate real SMS API here (MSG91/Twilio)
            # For now, use mock function
            send_sms_mock(member.phone, f"Your gym membership expires in {days_left} day(s). Please renew.")

def send_sms_mock(phone, message):
    # Placeholder for SMS integration
    print(f"[MOCK SMS] To: {phone} | Message: {message}")
