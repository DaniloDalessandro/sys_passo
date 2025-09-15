from django.contrib import admin
from .models import UserProfile, EmailVerification, PasswordResetToken

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(EmailVerification)
admin.site.register(PasswordResetToken)