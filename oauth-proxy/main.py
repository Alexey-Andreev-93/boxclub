import urllib.request
import urllib.parse
import os
import json

CLIENT_ID = os.environ.get("GH_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GH_CLIENT_SECRET", "")
BASE_URL = os.environ.get("BASE_URL", "")


def handler(event, context):
    path = event.get("path", event.get("requestContext", {}).get("path", ""))
    params = event.get("queryStringParameters") or {}
    multi = event.get("multiValueQueryStringParameters") or {}
    for k, v in multi.items():
        if k not in params and v:
            params[k] = v[0] if isinstance(v, list) else v

    if path.endswith("auth"):
        return handle_auth(params)
    elif path.endswith("callback"):
        return handle_callback(params)
    else:
        return respond(400, "Not found: use /auth or /callback")


def handle_auth(params):
    provider = params.get("provider", "github")
    scope = params.get("scope", "repo")
    redirect_uri = params.get("redirect_uri", "")
    site_id = params.get("site_id", "")
    state = params.get("state", "")

    # Use site_id as fallback for redirect_uri
    final_redirect = redirect_uri or (site_id or "")

    if not final_redirect:
        return respond(400, "redirect_uri required. Params: " + json.dumps(params))
    if not BASE_URL:
        return respond(500, "BASE_URL not configured")

    gh_params = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "redirect_uri": BASE_URL.rstrip("/") + "/callback",
        "scope": scope,
        "state": state or final_redirect,
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
