from django.db import models
from django.contrib.auth.models import User

from taggit.managers import TaggableManager


class Game(models.Model):
    name = models.CharField(null=False, unique=True, blank=False, max_length=32)
    description = models.TextField(null=False, blank=False)
    link = models.CharField(null=False, unique=True, blank=False, max_length=256)
    image = models.CharField(null=False, blank=False, max_length=256)
    tags = TaggableManager()

    class Meta:
        ordering = ('-name',)

    def __str__(self):
        return self.name


class Score(models.Model):
    account = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores', related_query_name='score')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='scores', related_query_name='score')
    points = models.IntegerField(null=False, blank=False)

    class Meta:
        ordering = ('-points',)

    def __str__(self):
        return f'{self.account.username} - {self.game.name} ({self.points} points)'
