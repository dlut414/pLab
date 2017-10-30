# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render

# Create your views here.
def index(request):
    CONTEXT = {
        'app_name' : 'pSampler',
    };
    return render(request, 'pSampler/index.html', context=CONTEXT);
