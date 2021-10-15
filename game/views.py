import math

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.generic import TemplateView, ListView, DetailView
from django.shortcuts import get_object_or_404

from .models import Game, Score


class LandingView(TemplateView):
    template_name = 'game/index.html'


class GameListView(ListView):
    template_name = 'game/games.html'
    queryset = Game.objects.all()
    context_object_name = 'games'


class GameView(DetailView):
    template_name = 'game/game.html'
    model = Game
    context_object_name = 'game'

    def get_context_data(self, **kwargs):
        game = get_object_or_404(Game, pk=self.kwargs.get('pk'))

        if self.request.user.is_authenticated:
            context = {'game': game,
                       'scores': Score.objects.filter(game__in=(game,), account__in=(self.request.user,))}
        else:
            context = {'game': game}

        return context


@login_required()
def save_score(request, pk=None, points=None):
    if request.method == 'GET':
        if request.is_ajax() and request.user.is_authenticated:
            game = get_object_or_404(Game, pk=pk)
            account = request.user
            p = math.floor(float(points))
            score = Score(game=game, account=account, points=p)

            Score.save(score)

            return JsonResponse({
                'detail': 'The score was successfully added to your score list.'
            }, status=201)

    return JsonResponse({
        'detail': 'Invalid save score request.'
    }, status=400, safe=False)


class MemoryView(TemplateView):
    template_name = 'game/memory.html'


class SliderView(TemplateView):
    template_name = 'game/slider.html'


class SimonView(TemplateView):
    template_name = 'game/simon.html'
