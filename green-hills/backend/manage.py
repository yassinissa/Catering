#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "greenhills.settings")
    try:
        from django.core.management import execute_from_command_line
        from django.core.management.commands.runserver import Command as Runserver
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Run:  py -m pip install -r requirements.txt  "
            "inside the backend folder (or activate the .venv first)."
        ) from exc
    # Green Hills runs on port 8010 by default, so it never clashes with other projects on 8000
    Runserver.default_port = "8010"
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
