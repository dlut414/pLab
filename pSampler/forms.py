from django import forms

class BasicViewForm(forms.Form):
    CHOICES = (
    );
    selected_scalar = forms.ChoiceField(widget=forms.Select(attrs={
                                            'id':'selected_scalar',
                                            'class':'w3-input w3-border',}),
                                        label='The column you wish to render: ',
                                        label_suffix='',
                                        choices=CHOICES,);
    range_max = forms.FloatField(widget=forms.NumberInput(attrs={
                                    'id':'range_max',
                                    'class':'w3-input w3-border',}),
                                 label='Max (mapping to red): ',
                                 label_suffix='',
                                 initial=1.0);
    range_min = forms.FloatField(widget=forms.NumberInput(attrs={
                                    'id':'range_min',
                                    'class':'w3-input w3-border',}),
                                 label='Min (mapping to blue): ',
                                 label_suffix='',
                                 initial=0.0);
        
    def clean_selected_scalar(self):
        data = self.cleaned_clean['selected_scalar'];
        return data;
    def clean_range_max(self):
        data = self.cleaned_clean['range_max'];
        return data;
    def clean_range_min(self):
        data = self.cleaned_clean['range_min'];
        return data;

class StreamlineForm(forms.Form):
    radius = forms.FloatField(widget=forms.NumberInput(attrs={
                                  'id':'radius',
                                  'class':'w3-input w3-border',}),
                              label='Effective radius: ',
                              label_suffix='',
                              initial=0.06,
                              min_value=0,
                              max_value=5);
    nlines = forms.IntegerField(widget=forms.NumberInput(attrs={
                                   'id':'nlines',
                                   'class':'w3-input w3-border',}),
                                label='Number of streamlines: ',
                                label_suffix='',
                                initial=10,
                                min_value=1,
                                max_value=30);
    slen = forms.FloatField(widget=forms.NumberInput(attrs={
                                'id':'slen',
                                'class':'w3-input w3-border',}),
                            label='Length of streamlines: ',
                            label_suffix='',
                            initial=1,
                            min_value=0.01,
                            max_value=1000);
    rsln = forms.FloatField(widget=forms.NumberInput(attrs={
                                'id':'rsln',
                                'class':'w3-input w3-border',}),
                            label='Integration step size: ',
                            label_suffix='',
                            initial=0.01,
                            min_value=0.001,
                            max_value=1);
    p1x = forms.FloatField(widget=forms.NumberInput(attrs={
                               'id':'p1x',
                               'style':'width:45%',}),
                           label='start x: ',
                           label_suffix='',
                           initial=0.0);
    p1y = forms.FloatField(widget=forms.NumberInput(attrs={
                               'id':'p1y',
                               'style':'width:45%',}),
                           label='start y: ',
                           label_suffix='',
                           initial=0.0);
    p2x = forms.FloatField(widget=forms.NumberInput(attrs={
                               'id':'p2x',
                               'style':'width:45%',}),
                           label='stop x: ',
                           label_suffix='',
                           initial=1.0);
    p2y = forms.FloatField(widget=forms.NumberInput(attrs={
                               'id':'p2y',
                               'style':'width:45%',}),
                           label='stop y: ',
                           label_suffix='',
                           initial=1.0);
    def clean_radius(self):
        data = self.cleaned_clean['radius'];
        return data;
    def clean_nlines(self):
        data = self.cleaned_clean['nlines'];
        return data;
    def clean_slen(self):
        data = self.cleaned_clean['slen'];
        return data;
    def clean_rsln(self):
        data = self.cleaned_clean['rsln'];
        return data;
    def clean_p1x(self):
        data = self.cleaned_clean['p1x'];
        return data;
    def clean_p1y(self):
        data = self.cleaned_clean['p1y'];
        return data;
    def clean_p2x(self):
        data = self.cleaned_clean['p2x'];
        return data;
    def clean_p2y(self):
        data = self.cleaned_clean['p2y'];
        return data;
