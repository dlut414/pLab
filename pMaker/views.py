# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.
def index(request):
    CONTEXT = {
        'app_name' : 'pMaker',
    };
    return render(request, 'pMaker/index.html', context=CONTEXT);
