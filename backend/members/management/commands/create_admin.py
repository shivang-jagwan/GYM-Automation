"""
Custom Django Management Command: create_admin

Automatically creates a Django superuser during deployment.
Designed for platforms like Railway that don't provide interactive shells.

SECURITY WARNING:
- Change the admin password immediately after first login
- Set DJANGO_SUPERUSER_PASSWORD env var in production
- Consider disabling this command after initial setup

Usage:
    python manage.py create_admin
"""

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a superuser if none exists (for automated deployments)'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables
        # Falls back to defaults ONLY for initial testing - change immediately!
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')
        
        # Check if any superuser already exists
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING('Superuser already exists. Skipping creation.')
            )
            return
        
        # Check if username is already taken (edge case)
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists. Skipping.')
            )
            return
        
        # Create the superuser
        try:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" created successfully.')
            )
            # Security reminder (no password in logs!)
            self.stdout.write(
                self.style.WARNING(
                    'IMPORTANT: Change the admin password after first login!'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create superuser: {str(e)}')
            )
