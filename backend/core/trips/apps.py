from django.apps import AppConfig
from django.core.management import call_command



class TripsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trips'

def ready(self):
    call_command('loaddata', 'users.json')