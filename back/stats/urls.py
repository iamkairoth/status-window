from django.urls import path
from .views import StatusEffectsView, CampaignsView, ExperienceView, ProjectsView, SkillsView, StatsView

urlpatterns = [
    path('status-effects/', StatusEffectsView.as_view(), name='status-effects'),
    path('campaigns/', CampaignsView.as_view(), name='campaigns'),
    path('experience/', ExperienceView.as_view(), name='experience'),
    path('projects/', ProjectsView.as_view(), name='projects'),
    path('skills/', SkillsView.as_view(), name='skills'),
    path('stats/<str:stat_name>/', StatsView.as_view(), name='stats'),
]