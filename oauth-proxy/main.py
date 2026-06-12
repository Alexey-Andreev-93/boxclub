import urllib.request
import urllib.parse
import os
import json

CLIENT_ID = os.environ.get("GH_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GH_CLIENT_SECRET", "")
BASE_URL = os.environ.get("BASE_URL", "")


def handler(event, context):
    method = event.get("httpMethod", "GET")
    path = event.get("path", event.get("requestContext", {}).get("path", ""))
    params = event.get("queryStringParameters") or {}

    if path.endswith("auth"):
        return handle_auth(params)
    elif path.endswith("callback"):
        return handle_callback(params)
    else:
        return respond(400, "Not found: use /auth or /callback")


def handle_auth(params):
    scope = params.get("scope", "repo")
    redirect_uri = params.get("redirect_uri", "")
    state = params.get("state", "")

    if not redirect_uri:
        return respond(400, "redirect_uri required")
    if not BASE_URL:
        return respond(500, "BASE_URL not configured")

    gh_params = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "redirect_uri": BASE_URL.rstrip("/") + "/callback",
        "scope": scope,
        "state": state,
    })
    gh_url = "https://github.com/login/oauth/authorize?" + gh_params
    return respond(302, "", headers={"Location": gh_url})


def handle_callback(params):
    code = params.get("code", "")
    state = params.get("state", "")

    if not code:
        return respond(400, "Missing code")

    data = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
    }).encode()

    req = urllib.request.Request(
        "https://github.com/login/oauth/access_token",
        data=data,
        headers={"Accept": "application/json"},
    )
    try:
        resp = urllib.request.urlopen(req)
        token_data = json.loads(resp.read())
    except Exception as e:
        return respond(500, f"Token exchange failed: {e}")

    access_token = token_data.get("access_token", "")

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body><script>
(function() {{
    function receiveMessage(message) {{
        window.opener.postMessage(
            {{ type: 'authorization', token: '{access_token}', provider: 'github' }},
            window.location.origin
        );
        window.close();
    }}
    window.addEventListener('message', receiveMessage, false);
    receiveMessage({{ data: null }});
}})();
</script></body></html>"""
    return respond(200, html, {"Content-Type": "text/html; charset=utf-8"})


def respond(code, body, headers=None):
    h = {"Content-Type": "text/plain"}
    if headers:
        h.update(headers)
    if code == 302:
        h.pop("Content-Type", None)
    return {
        "statusCode": code,
        "headers": h,
        "body": str(body),
        "isBase64Encoded": False,
    }
