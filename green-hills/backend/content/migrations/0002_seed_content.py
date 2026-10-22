from django.db import migrations


def seed(apps, schema_editor):
    from content.seed import seed_lists, seed_texts
    seed_texts(apps.get_model)
    seed_lists(apps.get_model)


class Migration(migrations.Migration):
    dependencies = [('content', '0001_initial')]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
