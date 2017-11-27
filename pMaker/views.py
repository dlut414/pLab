# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from .forms import BasicViewForm

# Create your views here.
def index(request):
    form = BasicViewForm();
    CONTEXT = {
        'app_name' : 'pMaker',
        'form' : form,
    };
    return render(request, 'pMaker/index.html', context=CONTEXT);
