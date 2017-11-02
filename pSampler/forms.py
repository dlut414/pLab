from django import forms

class SelectScalarForm(forms.Form):
    CHOICES = (
        ('0',0),
        ('1',1),
    );
    selected_scalar = forms.ChoiceField(widget=forms.Select(attrs={
                                            'id':'selected_scalar',
                                            'class':'w3-input w3-border',}),
                                        label='The column you wish to render: ',
                                        label_suffix='',
                                        choices=CHOICES);
    
    def clean_selected_scalar(self):
        data = self.cleaned_clean['selected_scalar'];
        return data;
