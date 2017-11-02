# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from .forms import BasicViewForm
from .forms import StreamlineForm

# Create your views here.
def index(request):
    form = BasicViewForm();
    form_sl = StreamlineForm();
    CONTEXT = {
        'app_name' : 'pSampler',
        'form' : form,
        'form_sl' : form_sl,
    };
    return render(request, 'pSampler/index.html', context=CONTEXT);
