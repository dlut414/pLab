# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import RequestInstance

@admin.register(RequestInstance)
class RequestInstanceAdmin(admin.ModelAdmin):
	list_display = ('ip_address', 'count', 'last_request');
