from django import forms

class BasicViewForm(forms.Form):
    color1 = forms.CharField(widget=forms.TextInput(attrs={
                                     'id':'color1',
                                     'class':'form-control form-control-sm',
                                     'type':'color',}),
                                 label='Color 1: ',
                                 label_suffix='',
                                 initial='#FF0000',);
    type1 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type1',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'1',}),
                                 label='Type 1: ',
                                 label_suffix='');
    color2 = forms.CharField(widget=forms.TextInput(attrs={
                                     'id':'color2',
                                     'class':'form-control form-control-sm',
                                     'type':'color',}),
                                 label='Color 2: ',
                                 label_suffix='',
                                 initial='#00FF00',);
    type2 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type2',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'2',}),
                                 label='Type 2: ',
                                 label_suffix='');
    color3 = forms.CharField(widget=forms.TextInput(attrs={
                                     'id':'color3',
                                     'class':'form-control form-control-sm',
                                     'type':'color',}),
                                 label='Color 3: ',
                                 label_suffix='',
                                 initial='#0000FF',);
    type3 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type3',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'3',}),
                                 label='Type 3: ',
                                 label_suffix='');
    color4 = forms.CharField(widget=forms.TextInput(attrs={
                                     'id':'color4',
                                     'class':'form-control form-control-sm',
                                     'type':'color',}),
                                 label='Color 4: ',
                                 label_suffix='',
                                 initial='#000000',);
    type4 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type4',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'4',}),
                                 label='Type 4: ',
                                 label_suffix='');
    color5 = forms.CharField(widget=forms.TextInput(attrs={
                                     'id':'color5',
                                     'class':'form-control form-control-sm',
                                     'type':'color',}),
                                 label='Color 5: ',
                                 label_suffix='',
                                 initial='#FFFFFF',);
    type5 = forms.IntegerField(widget=forms.NumberInput(attrs={
                                     'id':'type5',
                                     'class':'form-control form-control-sm',
                                     'placeholder':'5',}),
                                 label='Type 5: ',
                                 label_suffix='');
