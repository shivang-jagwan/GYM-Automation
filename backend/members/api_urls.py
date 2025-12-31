from django.urls import path
from .views import (
    login_view,
    dashboard_view,
    get_csrf_token,
    members_list,
    member_detail,
    broadcast_message,
    expiring_members,
    send_reminder,
)

urlpatterns = [
    path('login/', login_view, name='api-login'),
    path('dashboard/', dashboard_view, name='api-dashboard'),
    path('csrf/', get_csrf_token, name='api-csrf'),
    path('members/', members_list, name='api-members-list'),
    path('members/<int:pk>/', member_detail, name='api-member-detail'),
    path('broadcast/', broadcast_message, name='api-broadcast'),
    # Notification endpoints
    path('notifications/expiring/', expiring_members, name='api-expiring-members'),
    path('notifications/send-reminder/', send_reminder, name='api-send-reminder'),
]
