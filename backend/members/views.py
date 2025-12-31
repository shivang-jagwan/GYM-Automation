from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import render
from .models import Member, MessageLog
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token

# Import the notification service layer
from notifications.services import (
    NotificationService,
    send_broadcast_message as notify_broadcast,
    send_expiry_reminder as notify_expiry_reminder,
    send_membership_confirmation as notify_membership_confirmation,
)

@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except Exception:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return JsonResponse({'success': True, 'token': token.key})
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    total = Member.objects.count()
    active = Member.objects.filter(status='active').count()
    expired = Member.objects.filter(status='expired').count()
    from django.utils import timezone
    today = timezone.now().date()
    soon = today + timezone.timedelta(days=7)
    expiring_soon = Member.objects.filter(status='active', end_date__range=[today, soon]).count()
    return JsonResponse({
        'total_members': total,
        'active_members': active,
        'expired_members': expired,
        'expiring_soon': expiring_soon,
    })

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def members_list(request):
    if request.method == "GET":
        members = list(Member.objects.all().values())
        return JsonResponse(members, safe=False)
    if request.method == "POST":
        data = request.data
        member = Member.objects.create(
            name=data.get('name'),
            phone=data.get('phone'),
            membership_plan=data.get('membership_plan'),
            start_date=data.get('start_date'),
            duration_months=data.get('duration_months'),
            amount_paid=data.get('amount_paid'),
        )
        
        # Send membership confirmation via notification service
        # The service handles message generation, delivery, and logging
        notification_result = NotificationService.send_membership_confirmation(member)
        
        from django.forms.models import model_to_dict
        response_data = model_to_dict(member)
        response_data['notification_sent'] = notification_result.success
        return JsonResponse(response_data, status=201)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def member_detail(request, pk):
    try:
        member = Member.objects.get(pk=pk)
    except Member.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)
    from django.forms.models import model_to_dict
    if request.method == "GET":
        return JsonResponse(model_to_dict(member))
    if request.method == "PUT":
        data = request.data
        for field in ['name', 'phone', 'membership_plan', 'start_date', 'duration_months', 'amount_paid', 'status']:
            if field in data:
                setattr(member, field, data[field])
        member.save()
        return JsonResponse(model_to_dict(member))
    if request.method == "DELETE":
        member.delete()
        return JsonResponse({'success': True})

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def broadcast_message(request):
    """
    POST /api/broadcast/
    Send a broadcast message to all active members.
    
    Uses the NotificationService for delivery and logging.
    """
    data = request.data
    message = data.get('message')
    if not message:
        return JsonResponse({'error': 'Message required'}, status=400)
    
    active_members = Member.objects.filter(status='active')
    
    # Use notification service for broadcast
    # The service handles message formatting, delivery, and logging
    result = NotificationService.send_broadcast_message(active_members, message)
    
    return JsonResponse({
        'success': result.success,
        'sent': result.successful,
        'failed': result.failed,
        'total': result.total
    })

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})


# ============================================================
# NOTIFICATION APIs
# ============================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def expiring_members(request):
    """
    GET /api/notifications/expiring/
    Returns list of members whose membership expires within 7 days.
    """
    from django.utils import timezone
    today = timezone.now().date()
    soon = today + timezone.timedelta(days=7)
    
    expiring = Member.objects.filter(
        status='active',
        end_date__range=[today, soon]
    ).order_by('end_date')
    
    notifications = []
    for member in expiring:
        days_left = (member.end_date - today).days
        notifications.append({
            'id': member.id,
            'member_id': member.id,
            'member_name': member.name,
            'phone': member.phone,
            'end_date': member.end_date.isoformat(),
            'days_left': days_left,
            'message': 'Expires today' if days_left == 0 else f'Expires in {days_left} day{"s" if days_left != 1 else ""}'
        })
    
    return JsonResponse({
        'count': len(notifications),
        'notifications': notifications
    })


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def send_reminder(request):
    """
    POST /api/notifications/send-reminder/
    Send a reminder to a specific member about expiring membership.
    
    Uses the NotificationService for delivery and logging.
    Body: { member_id: int }
    """
    member_id = request.data.get('member_id')
    
    if not member_id:
        return JsonResponse({'error': 'member_id is required'}, status=400)
    
    try:
        member = Member.objects.get(pk=member_id)
    except Member.DoesNotExist:
        return JsonResponse({'error': 'Member not found'}, status=404)
    
    # Calculate days until expiration
    from django.utils import timezone
    today = timezone.now().date()
    days_left = (member.end_date - today).days if member.end_date else 0
    
    # Use notification service to send reminder
    # The service generates appropriate message based on days_left
    result = NotificationService.send_expiry_reminder(member, days_left)
    
    return JsonResponse({
        'success': result.success,
        'member_id': member.id,
        'member_name': member.name,
        'message_id': result.message_id,
        'status': result.status.value
    })
