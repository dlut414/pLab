# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from .forms import BasicViewForm
from .forms import StreamlineForm
from .models import RequestInstance

def get_client_ip(request):
	xff = request.META.get('HTTP_X_FORWARDED_FOR');
	if xff:
		print "xff found";
		ret = xff.split(',')[0];
	else:
		ret = request.META.get('REMOTE_ADDR');
	return ret;

def index(request):
	form = BasicViewForm();
	form_sl = StreamlineForm();
	CONTEXT = {
		'app_name' : 'pSampler', 
		'form' : form, 
		'form_sl' : form_sl,
		};
	ip = get_client_ip(request);
	request_ins = RequestInstance.objects.filter(ip_address=ip);
	if request_ins:
		request_ins[0].count += 1;
		request_ins[0].save();
	else:
		RequestInstance.objects.create(ip_address=ip);
	return render(request, 'pSampler/index.html', context=CONTEXT);
