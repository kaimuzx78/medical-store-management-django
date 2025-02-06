class CompanyBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyBank
        fields = '__all__'
        read_only_fields = ('added_on',)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['added_on'] = instance.added_on.strftime("%d/%m/%Y, %I:%M:%S %p")
        return representation 