from django.db import models
from django.utils import timezone
import datetime

class Member(models.Model):
	PLAN_CHOICES = [
		('strength', 'Strength'),
		('cardio', 'Cardio'),
		('both', 'Strength + Cardio'),
	]

	STATUS_CHOICES = [
		('active', 'Active'),
		('expired', 'Expired'),
	]

	name = models.CharField(max_length=100)
	phone = models.CharField(max_length=15)
	membership_plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
	start_date = models.DateField()
	duration_months = models.PositiveIntegerField()
	end_date = models.DateField(blank=True, null=True)  # Auto-calculated
	amount_paid = models.DecimalField(max_digits=8, decimal_places=2)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

	def save(self, *args, **kwargs):
		# Auto-calculate end_date
		if self.start_date and self.duration_months:
			if isinstance(self.start_date, str):
				self.start_date = datetime.datetime.strptime(self.start_date, "%Y-%m-%d").date()
			self.end_date = self.start_date + timezone.timedelta(days=30*self.duration_months)
		super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.name} ({self.phone})"


class MessageLog(models.Model):
	message = models.TextField()
	sent_at = models.DateTimeField(auto_now_add=True)
	recipients = models.ManyToManyField(Member, related_name='messages')

	def __str__(self):
		return f"Message at {self.sent_at} to {self.recipients.count()} members"

# Create your models here.
