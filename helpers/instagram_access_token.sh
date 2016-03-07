# https://www.instagram.com/oauth/authorize/?client_id=$1&redirect_uri=$2&response_type=code

curl \-F 'client_id=01658dfb60f449be942bd2c766824776' \
    -F 'client_secret=7da689e39f1740389394de6700685ef0' \
    -F 'grant_type=authorization_code' \
    -F 'redirect_uri=http://local.host' \
    -F 'code=b8846c361d8d43e5bdfa07aec907e2ee' \
    https://api.instagram.com/oauth/access_token
