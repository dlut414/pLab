# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.
def index(request):
    CONTEXT = {
        'app_name':'pFlow',
    };
    return render(request, 'pFlow/index.html', context=CONTEXT);
