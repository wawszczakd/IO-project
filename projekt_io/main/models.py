from django.db import models
import random
import string

def generate_room_code():
    characters = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(characters, k=6))

    while (Room.objects.filter(code=code).exists()):
        code = ''.join(random.choices(characters, k=6))

    return code

class Room(models.Model):
    code = models.CharField(max_length=6, primary_key=True, default=generate_room_code)

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        if not self.code or Room.objects.all().filter(code=self.code).exists():
            self.code = generate_room_code()
            
        super().save(*args, **kwargs)

