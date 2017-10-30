# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
import os
import sys
dir_path = os.path.join( os.path.dirname(__file__), 'python' );
sys.path.append( dir_path )
from NN import NN

nn = NN([3,3,3]);
nn.load(os.path.join(dir_path, 'config'));
# Create your views here.
def index(request):
    CONTEXT = {
        'app_name' : 'Classifier',
    };
    return render(request, 'Classifier/index.html', context=CONTEXT);
