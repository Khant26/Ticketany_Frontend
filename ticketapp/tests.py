from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth.models import AnonymousUser
from django.test import TestCase
from django.utils import timezone

from .models import Category, Customer, Event, Order, Ticket
from .permissions import IsAdminOrReadOnly, TicketPermission
from .serializers import AdminTicketSerializer, TicketCreateSerializer


class CustomerModelTests(TestCase):
    def test_manager_normalizes_email_and_hashes_password(self):
        customer = Customer.objects.create_user(
            email="Person@EXAMPLE.COM",
            password="safe-test-password",
            name="Test Person",
        )

        self.assertEqual(customer.email, "Person@example.com")
        self.assertTrue(customer.check_password("safe-test-password"))

    @patch("ticketapp.models.random.randint", return_value=123456)
    def test_otp_lifecycle(self, _mock_randint):
        customer = Customer.objects.create_user(
            email="otp@example.com", password="safe-test-password", name="OTP User"
        )

        self.assertEqual(customer.generate_otp("signup"), "123456")
        self.assertTrue(customer.verify_otp("123456", "signup"))
        self.assertFalse(customer.verify_otp("654321", "signup"))

        customer.otp_created_at = timezone.now() - timedelta(minutes=11)
        customer.save(update_fields=["otp_created_at"])
        self.assertFalse(customer.verify_otp("123456", "signup"))

        customer.clear_otp()
        self.assertIsNone(customer.otp_code)
        self.assertIsNone(customer.otp_created_at)
        self.assertIsNone(customer.otp_type)


class TicketSerializerTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create_user(
            email="buyer@example.com",
            password="safe-test-password",
            name="Buyer",
            is_active=True,
        )
        category = Category.objects.create(category_name="Concert")
        self.event = Event.objects.create(
            event_name="Test Event",
            event_location="Bangkok",
            category=category,
        )
        self.ticket = Ticket.objects.create(
            passport_name="Buyer",
            facebook_name="Buyer FB",
            event=self.event,
            order=Order.objects.create(customer=self.customer, event=self.event),
        )

    def test_ticket_creation_also_creates_customer_order(self):
        serializer = TicketCreateSerializer(
            data={
                "passport_name": "Second Buyer",
                "facebook_name": "Second Buyer FB",
                "event": self.event.pk,
            },
            context={"request": SimpleNamespace(user=self.customer)},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        ticket = serializer.save()
        self.assertEqual(ticket.order.customer, self.customer)
        self.assertEqual(ticket.order.event, self.event)
        self.assertEqual(ticket.status, "pending")
        self.assertEqual(ticket.refund_status, "none")

    def test_paid_status_requires_payment_details(self):
        serializer = AdminTicketSerializer(
            self.ticket, data={"status": "paid"}, partial=True
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("customer_payment", str(serializer.errors))

    def test_complete_status_requires_fulfilment_details(self):
        serializer = AdminTicketSerializer(
            self.ticket, data={"status": "complete"}, partial=True
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("selling_price", str(serializer.errors))

    def test_cancel_status_requires_refund_state(self):
        serializer = AdminTicketSerializer(
            self.ticket, data={"status": "cancel"}, partial=True
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("refund_status", str(serializer.errors))

    def test_valid_paid_transition_is_accepted(self):
        serializer = AdminTicketSerializer(
            self.ticket,
            data={
                "status": "paid",
                "customer_payment": "bank transfer",
                "payment_date": "2026-09-06",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)


class PermissionTests(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create_user(
            email="owner@example.com",
            password="safe-test-password",
            name="Owner",
            is_active=True,
        )
        self.other_customer = Customer.objects.create_user(
            email="other@example.com",
            password="safe-test-password",
            name="Other",
            is_active=True,
        )
        self.staff = Customer.objects.create_superuser(
            email="admin@example.com", password="safe-test-password", name="Admin"
        )
        category = Category.objects.create(category_name="Sports")
        event = Event.objects.create(
            event_name="Final", event_location="Bangkok", category=category
        )
        order = Order.objects.create(customer=self.customer, event=event)
        self.ticket = Ticket.objects.create(
            passport_name="Owner", facebook_name="Owner FB", event=event, order=order
        )

    def test_public_resources_are_read_only_for_anonymous_users(self):
        permission = IsAdminOrReadOnly()

        self.assertTrue(
            permission.has_permission(SimpleNamespace(method="GET", user=AnonymousUser()), None)
        )
        self.assertFalse(
            permission.has_permission(SimpleNamespace(method="POST", user=AnonymousUser()), None)
        )
        self.assertTrue(
            permission.has_permission(SimpleNamespace(method="POST", user=self.staff), None)
        )

    def test_ticket_owner_and_staff_object_access(self):
        permission = TicketPermission()

        self.assertTrue(
            permission.has_object_permission(
                SimpleNamespace(method="GET", user=self.customer), None, self.ticket
            )
        )
        self.assertFalse(
            permission.has_object_permission(
                SimpleNamespace(method="GET", user=self.other_customer), None, self.ticket
            )
        )
        self.assertTrue(
            permission.has_object_permission(
                SimpleNamespace(method="PATCH", user=self.staff), None, self.ticket
            )
        )


class ModelDefaultTests(TestCase):
    def test_ticket_default_status_uses_choice_value(self):
        self.assertEqual(Ticket._meta.get_field("status").get_default(), "pending")
