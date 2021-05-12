from django.contrib import admin
from django.urls import path

from SC import views as SC_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", SC_views.index),
    path("data", SC_views.data_transfer),
    path("getsc", SC_views.get_sc)
    path("getflow", SC_views.get_flows)
]