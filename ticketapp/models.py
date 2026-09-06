from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import random
from datetime import timedelta
from django.utils import timezone
from cloudinary.models import CloudinaryField

class CustomerManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("email_verified", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)

class Customer(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False) # default to False until email is verified
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    # OTP fields (for sign up and forgot password)
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    otp_type = models.CharField(max_length=20, null=True, blank=True)  # 'signup' or 'forgot_password'

    objects = CustomerManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"] 

    def __str__(self):
        return self.name
    
    def generate_otp(self, otp_type='verification'):
        """Generate a 6-digit OTP and save it with the current timestamp and type."""
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_created_at = timezone.now()
        self.otp_type = otp_type
        self.save()
        return self.otp_code
    
    def verify_otp(self, otp_code, otp_type='verification'):
        """Verify OTP code (expires in 10 minutes)."""
        if not self.otp_code or not self.otp_created_at or self.otp_code != otp_code or self.otp_type != otp_type:
            return False
        # Check if OTP is expired (10 minutes validity)
        expiry_time = self.otp_created_at + timedelta(minutes=10)
        if timezone.now() > expiry_time:
            return False
        # OTP is valid
        return True
    
    def clear_otp(self):
        """Clear OTP fields after successful verification."""
        self.otp_code = None
        self.otp_created_at = None
        self.otp_type = None
        self.save()

class Banner(models.Model):
    banner_name = models.CharField(max_length=100)
    banner_image = CloudinaryField('image', null=True, blank=True)
    def __str__(self):
        return self.banner_name

class Category(models.Model):
    category_name = models.CharField(max_length=100)
    category_image = CloudinaryField('image', null=True, blank=True)
    is_hidden = models.BooleanField(default=False)
    def __str__(self):
        return self.category_name
    
class Event(models.Model):
    event_name = models.CharField(max_length=255)
    event_date = models.JSONField(null=True, blank=True)
    event_time = models.CharField(max_length=100, null=True, blank=True)
    event_location = models.CharField(max_length=255)
    sale_date = models.CharField(max_length=100, null=True, blank=True)
    ticket_price = models.JSONField(null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    is_hidden = models.BooleanField(default=False)
    def __str__(self):
        return self.event_name
    
class EventImage(models.Model):
    image = CloudinaryField('image', null=True, blank=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')   
    def __str__(self):
        return f"Image for {self.event.event_name}"
     
class Order(models.Model):
    order_time = models.DateTimeField(auto_now_add=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null =True)
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True)
    def __str__(self):
        return f"Order {self.id} by {self.customer}"

class Ticket(models.Model):
    passport_name = models.CharField(max_length=255)
    facebook_name = models.CharField(max_length=255)
    member_code = models.CharField(max_length=100, null=True, blank=True)
    priority_date = models.CharField(max_length=100, null=True, blank=True)
    fst_pt = models.CharField(max_length=20, null=True, blank=True) # change the max_length 20-->50 (if need)
    snd_pt = models.CharField(max_length=20, null=True, blank=True) # change the max_length 20-->50
    trd_pt = models.CharField(max_length=20, null=True, blank=True) # change the max_length 20-->50    
    # status field with choices
    STATUS_CHOICES = [  
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('complete', 'Complete'),
        ('cancel', 'Cancel')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # for paid status
    customer_payment = models.CharField(max_length=100, null=True, blank=True)
    payment_date = models.CharField(max_length=100, null=True, blank=True)
    # for complete status
    selling_price = models.CharField(max_length=100, null=True, blank=True)
    zone = models.CharField(max_length=100, null=True, blank=True)
    row = models.CharField(max_length=100, null=True, blank=True)
    seat = models.CharField(max_length=100, null=True, blank=True)
    # for refund sub-status
    REFUND_CHOICES = [
        ('none', 'None'),
        ('in_process', 'In Process'),
        ('refunded', 'Refunded')
    ]
    refund_status = models.CharField(max_length=20, choices=REFUND_CHOICES, default='none')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True)
    def __str__(self):
        return f"Ticket {self.id} - {self.passport_name} ({self.status})"