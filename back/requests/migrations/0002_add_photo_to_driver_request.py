# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverrequest',
            name='photo',
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to='requests/driver/photos/',
                verbose_name='Foto (JPG/PNG)',
                help_text='Foto do motorista (opcional)'
            ),
        ),
    ]
