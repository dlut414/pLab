# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
import os
import sys
dir_path = os.path.join( os.path.dirname(__file__), 'python' );
sys.path.append( dir_path )

# Create your views here.
def index(request):
    CONTEXT = {
        'app_name' : 'Classifier',
    };
    return render(request, 'Classifier/index.html', context=CONTEXT);
