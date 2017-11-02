# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from .forms import SelectScalarForm

# Create your views here.
def index(request):
    form = SelectScalarForm();
    CONTEXT = {
        'app_name' : 'pSampler',
        'form' : form,
    };
    return render(request, 'pSampler/index.html', context=CONTEXT);
