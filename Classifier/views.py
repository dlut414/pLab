# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'python'))
from NN import NN

nn = NN([3,3,3]);
nn.load('config');
# Create your views here.
def index(request):
    
    CONTEXT = {

    };
    return render(request, 'index.html', context=CONTEXT);
