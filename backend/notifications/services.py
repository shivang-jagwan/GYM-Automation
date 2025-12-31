"""
================================================================================
NOTIFICATION SERVICE LAYER
================================================================================

This module provides a centralized, provider-agnostic notification service
for the Gym Management System.

ARCHITECTURE OVERVIEW:
----------------------
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│                    (Views, APIs, Background Tasks)                          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION SERVICE LAYER                              │
│                         (This Module)                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Message         │  │ Delivery        │  │ Logging         │              │
│  │ Templates       │  │ Orchestration   │  │ & Tracking      │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROVIDER LAYER (PLUGGABLE)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Mock    │  │  MSG91   │  │  Twilio  │  │ WhatsApp │  │  Email   │      │
│  │ (Current)│  │ (Future) │  │ (Future) │  │ (Future) │  │ (Future) │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘

DESIGN PRINCIPLES:
------------------
1. Single Responsibility: Each function handles one notification type
2. Provider Agnostic: Business logic is separated from delivery mechanism
3. Fail-Safe: All functions return consistent response objects
4. Auditable: All notifications are logged for tracking
5. Extensible: Easy to add new notification types or providers

USAGE:
------
    from notifications.services import NotificationService
    
    # Send expiry reminder
    result = NotificationService.send_expiry_reminder(member, days_left=3)
    if result.success:
        print(f"Notification queued: {result.message_id}")

FUTURE INTEGRATION:
-------------------
To integrate a real SMS provider (e.g., MSG91, Twilio):
1. Create a provider class in notifications/providers/
2. Implement the BaseProvider interface
3. Update NOTIFICATION_PROVIDER in settings.py
4. The service layer remains unchanged

================================================================================
"""

import logging
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from enum import Enum
from django.conf import settings
from django.utils import timezone

# Configure module logger
logger = logging.getLogger(__name__)


# =============================================================================
# ENUMS & CONSTANTS
# =============================================================================

class NotificationType(Enum):
    """
    Enumeration of all notification types in the system.
    Used for logging, analytics, and message template selection.
    """
    MEMBERSHIP_CONFIRMATION = "membership_confirmation"
    EXPIRY_REMINDER = "expiry_reminder"
    MEMBERSHIP_EXPIRED = "membership_expired"
    BROADCAST = "broadcast"
    PAYMENT_REMINDER = "payment_reminder"
    WELCOME = "welcome"
    RENEWAL_SUCCESS = "renewal_success"


class DeliveryChannel(Enum):
    """
    Supported delivery channels.
    Currently only SMS (mock), but designed for future expansion.
    """
    SMS = "sms"
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    PUSH = "push"


class DeliveryStatus(Enum):
    """
    Status of notification delivery attempt.
    """
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    MOCK = "mock"  # Used when running mock provider


# =============================================================================
# RESPONSE OBJECTS
# =============================================================================

@dataclass
class NotificationResult:
    """
    Standardized response object for all notification operations.
    
    Attributes:
        success: Whether the operation completed without errors
        message_id: Unique identifier for tracking (None if failed)
        status: Delivery status enum
        channel: Which channel was used
        error: Error message if failed, None otherwise
        metadata: Additional provider-specific data
    """
    success: bool
    message_id: Optional[str] = None
    status: DeliveryStatus = DeliveryStatus.PENDING
    channel: DeliveryChannel = DeliveryChannel.SMS
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'success': self.success,
            'message_id': self.message_id,
            'status': self.status.value,
            'channel': self.channel.value,
            'error': self.error,
            'metadata': self.metadata or {}
        }


@dataclass
class BulkNotificationResult:
    """
    Response object for bulk notification operations.
    """
    total: int
    successful: int
    failed: int
    results: List[NotificationResult]
    
    @property
    def success(self) -> bool:
        """Returns True if at least one notification succeeded."""
        return self.successful > 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'total': self.total,
            'successful': self.successful,
            'failed': self.failed,
            'success_rate': f"{(self.successful / self.total * 100):.1f}%" if self.total > 0 else "0%"
        }


# =============================================================================
# MESSAGE TEMPLATES
# =============================================================================

class MessageTemplates:
    """
    Centralized message templates for all notification types.
    
    Benefits:
    - Easy to update messaging across the system
    - Supports i18n/l10n in the future
    - Consistent tone and branding
    
    Template variables use Python string formatting.
    """
    
    @classmethod
    def get_gym_name(cls) -> str:
        """Get gym name from settings (lazy loaded to avoid Django config issues)."""
        return getattr(settings, 'GYM_NAME', 'FitZone Gym')
    
    WELCOME = (
        "Welcome to {gym_name}, {member_name}! 🎉 "
        "Your membership is now active. "
        "We're excited to have you on this fitness journey!"
    )
    
    MEMBERSHIP_CONFIRMATION = (
        "Hi {member_name}, your {gym_name} membership is confirmed! ✅ "
        "Plan: {plan_name} | Valid until: {end_date}. "
        "See you at the gym!"
    )
    
    EXPIRY_REMINDER = (
        "Hi {member_name}, your {gym_name} membership expires in {days_left} day{plural}. "
        "Renew now to continue your fitness journey without interruption! 💪"
    )
    
    EXPIRY_TODAY = (
        "⚠️ Hi {member_name}, your {gym_name} membership expires TODAY. "
        "Renew now to avoid any break in your training!"
    )
    
    MEMBERSHIP_EXPIRED = (
        "Hi {member_name}, your {gym_name} membership has expired. "
        "We miss you! Renew today and get back to achieving your goals. 🏋️"
    )
    
    RENEWAL_SUCCESS = (
        "Great news, {member_name}! 🎉 Your {gym_name} membership has been renewed. "
        "New validity: {end_date}. Keep up the amazing work!"
    )
    
    PAYMENT_REMINDER = (
        "Hi {member_name}, this is a reminder about your pending payment of ₹{amount} "
        "at {gym_name}. Please clear it at your earliest convenience."
    )
    
    BROADCAST_PREFIX = "[{gym_name}] "
    
    @classmethod
    def get_expiry_message(cls, member_name: str, days_left: int) -> str:
        """Generate appropriate expiry message based on days remaining."""
        gym_name = cls.get_gym_name()
        if days_left <= 0:
            return cls.MEMBERSHIP_EXPIRED.format(
                member_name=member_name,
                gym_name=gym_name
            )
        elif days_left == 0:
            return cls.EXPIRY_TODAY.format(
                member_name=member_name,
                gym_name=gym_name
            )
        else:
            return cls.EXPIRY_REMINDER.format(
                member_name=member_name,
                gym_name=gym_name,
                days_left=days_left,
                plural='s' if days_left != 1 else ''
            )


# =============================================================================
# PROVIDER INTERFACE (FOR FUTURE IMPLEMENTATION)
# =============================================================================

class BaseNotificationProvider:
    """
    Abstract base class for notification providers.
    
    To integrate a real SMS provider:
    1. Create a new class that inherits from BaseNotificationProvider
    2. Implement the send() method
    3. Register in NotificationService._get_provider()
    
    Example for MSG91:
    ------------------
    class MSG91Provider(BaseNotificationProvider):
        def __init__(self):
            self.api_key = settings.MSG91_API_KEY
            self.sender_id = settings.MSG91_SENDER_ID
            
        def send(self, phone: str, message: str, **kwargs) -> NotificationResult:
            try:
                response = requests.post(
                    'https://api.msg91.com/api/v5/flow/',
                    headers={'authkey': self.api_key},
                    json={
                        'sender': self.sender_id,
                        'mobiles': phone,
                        'message': message
                    }
                )
                if response.status_code == 200:
                    return NotificationResult(
                        success=True,
                        message_id=response.json().get('request_id'),
                        status=DeliveryStatus.SENT,
                        channel=DeliveryChannel.SMS
                    )
                else:
                    return NotificationResult(
                        success=False,
                        status=DeliveryStatus.FAILED,
                        error=response.text
                    )
            except Exception as e:
                return NotificationResult(
                    success=False,
                    status=DeliveryStatus.FAILED,
                    error=str(e)
                )
    """
    
    def send(self, phone: str, message: str, **kwargs) -> NotificationResult:
        """
        Send a notification to the specified phone number.
        Must be implemented by concrete providers.
        """
        raise NotImplementedError("Subclasses must implement send()")
    
    def send_bulk(self, recipients: List[Dict], message: str, **kwargs) -> BulkNotificationResult:
        """
        Send bulk notifications. Default implementation calls send() in loop.
        Override for providers with native bulk support.
        """
        results = []
        for recipient in recipients:
            result = self.send(recipient['phone'], message, **kwargs)
            results.append(result)
        
        successful = sum(1 for r in results if r.success)
        return BulkNotificationResult(
            total=len(recipients),
            successful=successful,
            failed=len(recipients) - successful,
            results=results
        )


class MockNotificationProvider(BaseNotificationProvider):
    """
    Mock provider for development and testing.
    
    This provider:
    - Logs all messages to console and Python logger
    - Returns successful results
    - Simulates realistic behavior
    
    Safe for production as it doesn't send real messages.
    """
    
    def send(self, phone: str, message: str, **kwargs) -> NotificationResult:
        """
        Mock send - logs to console, returns success.
        """
        import uuid
        
        # Generate mock message ID
        message_id = f"mock_{uuid.uuid4().hex[:12]}"
        
        # Log to console (visible in Django runserver output)
        print(f"\n{'='*60}")
        print(f"📱 NOTIFICATION (Mock Delivery)")
        print(f"{'='*60}")
        print(f"To: {phone}")
        print(f"Message: {message}")
        print(f"ID: {message_id}")
        print(f"Time: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")
        
        # Also log to Python logger for production monitoring
        logger.info(
            f"[MOCK NOTIFICATION] To: {phone} | ID: {message_id} | "
            f"Message: {message[:50]}..."
        )
        
        return NotificationResult(
            success=True,
            message_id=message_id,
            status=DeliveryStatus.MOCK,
            channel=DeliveryChannel.SMS,
            metadata={
                'provider': 'mock',
                'phone': phone,
                'timestamp': timezone.now().isoformat()
            }
        )


# =============================================================================
# MAIN NOTIFICATION SERVICE
# =============================================================================

class NotificationService:
    """
    Main notification service class.
    
    This is the primary interface for sending notifications throughout
    the application. All notification sending should go through this service.
    
    Features:
    - Provider-agnostic design
    - Automatic message logging
    - Consistent error handling
    - Support for multiple notification types
    
    Usage:
        # Single notification
        result = NotificationService.send_expiry_reminder(member, days_left=3)
        
        # Broadcast
        result = NotificationService.send_broadcast(members, "Gym closed tomorrow")
    """
    
    # Provider instance (singleton pattern)
    _provider: Optional[BaseNotificationProvider] = None
    
    @classmethod
    def _get_provider(cls) -> BaseNotificationProvider:
        """
        Get or initialize the notification provider.
        
        Provider selection based on settings:
        - 'mock' (default): MockNotificationProvider
        - 'msg91': MSG91Provider (future)
        - 'twilio': TwilioProvider (future)
        
        To switch providers in production:
        1. Set NOTIFICATION_PROVIDER in settings.py
        2. Add provider credentials to settings
        """
        if cls._provider is None:
            provider_name = getattr(settings, 'NOTIFICATION_PROVIDER', 'mock')
            
            if provider_name == 'mock':
                cls._provider = MockNotificationProvider()
            # TODO: Add real providers here
            # elif provider_name == 'msg91':
            #     from notifications.providers.msg91 import MSG91Provider
            #     cls._provider = MSG91Provider()
            # elif provider_name == 'twilio':
            #     from notifications.providers.twilio import TwilioProvider
            #     cls._provider = TwilioProvider()
            else:
                logger.warning(f"Unknown provider '{provider_name}', falling back to mock")
                cls._provider = MockNotificationProvider()
        
        return cls._provider
    
    @classmethod
    def _log_notification(
        cls,
        member,
        message: str,
        notification_type: NotificationType,
        result: NotificationResult
    ) -> None:
        """
        Log notification to database using existing MessageLog model.
        
        This creates an audit trail of all notifications sent.
        """
        try:
            # Import here to avoid circular imports
            from members.models import MessageLog
            
            # Create log entry with type prefix for filtering
            log_message = f"[{notification_type.value.upper()}] {message}"
            log = MessageLog.objects.create(message=log_message)
            
            # Associate with member if provided
            if member is not None:
                if hasattr(member, '__iter__') and not isinstance(member, str):
                    # Multiple members (queryset or list)
                    log.recipients.set(member)
                else:
                    # Single member
                    log.recipients.set([member])
            
            logger.debug(f"Notification logged: {log.id}")
            
        except Exception as e:
            # Don't fail the notification if logging fails
            logger.error(f"Failed to log notification: {e}")
    
    # =========================================================================
    # PUBLIC API - NOTIFICATION METHODS
    # =========================================================================
    
    @classmethod
    def send_welcome_message(cls, member) -> NotificationResult:
        """
        Send welcome message to a new member.
        
        Args:
            member: Member model instance
            
        Returns:
            NotificationResult with delivery status
        """
        message = MessageTemplates.WELCOME.format(
            gym_name=MessageTemplates.get_gym_name(),
            member_name=member.name
        )
        
        provider = cls._get_provider()
        result = provider.send(member.phone, message)
        
        # Log to database
        cls._log_notification(member, message, NotificationType.WELCOME, result)
        
        return result
    
    @classmethod
    def send_membership_confirmation(cls, member) -> NotificationResult:
        """
        Send membership confirmation after successful registration or renewal.
        
        Args:
            member: Member model instance with membership details
            
        Returns:
            NotificationResult with delivery status
        """
        # Format plan name for display
        plan_display = dict(member.PLAN_CHOICES).get(member.membership_plan, member.membership_plan)
        
        message = MessageTemplates.MEMBERSHIP_CONFIRMATION.format(
            gym_name=MessageTemplates.get_gym_name(),
            member_name=member.name,
            plan_name=plan_display,
            end_date=member.end_date.strftime('%d %b %Y') if member.end_date else 'N/A'
        )
        
        provider = cls._get_provider()
        result = provider.send(member.phone, message)
        
        cls._log_notification(member, message, NotificationType.MEMBERSHIP_CONFIRMATION, result)
        
        return result
    
    @classmethod
    def send_expiry_reminder(cls, member, days_left: int) -> NotificationResult:
        """
        Send membership expiry reminder.
        
        Args:
            member: Member model instance
            days_left: Number of days until membership expires
            
        Returns:
            NotificationResult with delivery status
        """
        message = MessageTemplates.get_expiry_message(member.name, days_left)
        
        provider = cls._get_provider()
        result = provider.send(member.phone, message)
        
        notification_type = (
            NotificationType.MEMBERSHIP_EXPIRED if days_left <= 0 
            else NotificationType.EXPIRY_REMINDER
        )
        cls._log_notification(member, message, notification_type, result)
        
        return result
    
    @classmethod
    def send_renewal_confirmation(cls, member) -> NotificationResult:
        """
        Send confirmation after successful membership renewal.
        
        Args:
            member: Member model instance with updated end_date
            
        Returns:
            NotificationResult with delivery status
        """
        message = MessageTemplates.RENEWAL_SUCCESS.format(
            gym_name=MessageTemplates.get_gym_name(),
            member_name=member.name,
            end_date=member.end_date.strftime('%d %b %Y') if member.end_date else 'N/A'
        )
        
        provider = cls._get_provider()
        result = provider.send(member.phone, message)
        
        cls._log_notification(member, message, NotificationType.RENEWAL_SUCCESS, result)
        
        return result
    
    @classmethod
    def send_payment_reminder(cls, member, amount: float) -> NotificationResult:
        """
        Send payment reminder to member.
        
        Args:
            member: Member model instance
            amount: Outstanding payment amount
            
        Returns:
            NotificationResult with delivery status
        """
        message = MessageTemplates.PAYMENT_REMINDER.format(
            gym_name=MessageTemplates.get_gym_name(),
            member_name=member.name,
            amount=f"{amount:,.2f}"
        )
        
        provider = cls._get_provider()
        result = provider.send(member.phone, message)
        
        cls._log_notification(member, message, NotificationType.PAYMENT_REMINDER, result)
        
        return result
    
    @classmethod
    def send_broadcast_message(cls, members, message: str) -> BulkNotificationResult:
        """
        Send broadcast message to multiple members.
        
        Args:
            members: QuerySet or list of Member instances
            message: Message content to broadcast
            
        Returns:
            BulkNotificationResult with aggregate delivery status
        """
        # Prepend gym name to broadcast messages
        full_message = MessageTemplates.BROADCAST_PREFIX.format(
            gym_name=MessageTemplates.get_gym_name()
        ) + message
        
        provider = cls._get_provider()
        results = []
        
        for member in members:
            result = provider.send(member.phone, full_message)
            results.append(result)
        
        successful = sum(1 for r in results if r.success)
        bulk_result = BulkNotificationResult(
            total=len(results),
            successful=successful,
            failed=len(results) - successful,
            results=results
        )
        
        # Log broadcast to database
        cls._log_notification(members, full_message, NotificationType.BROADCAST, results[0] if results else None)
        
        logger.info(f"Broadcast sent: {successful}/{len(results)} successful")
        
        return bulk_result
    
    @classmethod
    def send_custom_message(
        cls, 
        member, 
        message: str, 
        notification_type: NotificationType = NotificationType.BROADCAST
    ) -> NotificationResult:
        """
        Send a custom message to a single member.
        
        Use this for one-off messages that don't fit standard templates.
        
        Args:
            member: Member model instance
            message: Custom message content
            notification_type: Type for logging purposes
            
        Returns:
            NotificationResult with delivery status
        """
        provider = cls._get_provider()
        result = provider.send(member.phone, message)
        
        cls._log_notification(member, message, notification_type, result)
        
        return result


# =============================================================================
# CONVENIENCE FUNCTIONS (BACKWARDS COMPATIBILITY)
# =============================================================================

def send_membership_confirmation(member) -> NotificationResult:
    """Convenience function for sending membership confirmation."""
    return NotificationService.send_membership_confirmation(member)


def send_expiry_reminder(member, days_left: int) -> NotificationResult:
    """Convenience function for sending expiry reminder."""
    return NotificationService.send_expiry_reminder(member, days_left)


def send_broadcast_message(members, message: str) -> BulkNotificationResult:
    """Convenience function for sending broadcast messages."""
    return NotificationService.send_broadcast_message(members, message)


def send_welcome_message(member) -> NotificationResult:
    """Convenience function for sending welcome message."""
    return NotificationService.send_welcome_message(member)


# =============================================================================
# MODULE INITIALIZATION
# =============================================================================

# Log module load for debugging
logger.debug("Notification service module loaded")
