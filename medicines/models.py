class CompanyBank(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='bank_accounts')
    bank_account_no = models.CharField(max_length=100)
    ifsc_no = models.CharField(max_length=30)
    added_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.name} - {self.bank_account_no}" 