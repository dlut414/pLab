from django import forms

class BasicViewForm(forms.Form):
    color1 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'color1',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'0-255',}),
                                 label='Color 1: ',
                                 label_suffix='');
    type1 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type1',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'1',}),
                                 label='Type 1: ',
                                 label_suffix='');
    color2 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'color2',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'0-255',}),
                                 label='Color 2: ',
                                 label_suffix='');
    type2 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type2',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'2',}),
                                 label='Type 2: ',
                                 label_suffix='');
    color3 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'color1',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'0-255',}),
                                 label='Color 3: ',
                                 label_suffix='');
    type3 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type3',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'3',}),
                                 label='Type 3: ',
                                 label_suffix='');
