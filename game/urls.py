from django.urls import path

from .views import LandingView, GameListView, GameView, MemoryView, SliderView, SimonView, save_score

urlpatterns = [
    path('', LandingView.as_view(), name='game_landing'),
    path('games/', GameListView.as_view(), name='game_list'),
    path('games/memory/', MemoryView.as_view(), name='game_memory'),
    path('games/slider/', SliderView.as_view(), name='game_slider'),
    path('games/simon/', SimonView.as_view(), name='game_simon'),
    path('games/<pk>/save_score/<points>/', save_score, name='game_save_score'),
    path('games/<pk>/', GameView.as_view(), name='game'),
]
