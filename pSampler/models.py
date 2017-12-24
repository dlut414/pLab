# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

class RequestInstance(models.Model):
	class Meta:
		ordering = ["-count", "-last_request"];
		
	ip_address = models.GenericIPAddressField(protocol='both', unpack_ipv4=True, db_index=True);
	count = models.IntegerField(default=1);
	last_request = models.DateTimeField(auto_now=True);
	
	def __str__(self):
		return self.ip_address;
