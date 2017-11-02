from django import forms

class SelectScalarForm(forms.Form):
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
                                 label='Max: ',
                                 label_suffix='',
                                 initial=1.0);
    range_min = forms.FloatField(widget=forms.NumberInput(attrs={
                                    'id':'range_min',
                                    'class':'w3-input w3-border',}),
                                 label='Min: ',
                                 label_suffix='',
                                 initial=0.0);
        
    def clean_selected_scalar(self):
        data = self.cleaned_clean['selected_scalar', 'range_max', 'range_min'];
        return data;
