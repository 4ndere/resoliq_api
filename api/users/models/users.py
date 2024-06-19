"""User Model."""

# Django
from django.db import models
from django.contrib.auth.models import AbstractUser

# Utils
from api.utils.models import ModelApi


class User(ModelApi, AbstractUser):

    email = models.EmailField(
        "email address", unique=True, error_messages={"unique": "El usuario ya existe."}
    )

    USERNAME_FIELD = "email"

    dni = models.CharField(max_length=13)

    REQUIRED_FIELDS = ["username", "first_name", "last_name", "dni"]

    phone_number = models.CharField(max_length=500, blank=True, null=True)

    PROFILES = [
        ("SWR", "Software"),
        ("HWR", "Hardware"),
    ]

    type_user = models.CharField(max_length=3, choices=PROFILES)

    is_verified = models.BooleanField(
        default=True,
        help_text="Se establece en verdadero cuando el usuario ha verificado su dirección de correo electrónico",
    )

    def __str__(self):
        return self.email

    def get_short_name(self):
        return self.username
