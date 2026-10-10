from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailOrUsernameBackend(ModelBackend):
    """Lets staff sign in to the admin with either their username or their email address."""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        User = get_user_model()
        login = username.strip()
        if '@' in login:
            user = User.objects.filter(email__iexact=login).order_by('id').first()
        else:
            user = User.objects.filter(username__iexact=login).first()
        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        User().set_password(password)  # same timing whether or not the account exists
        return None
