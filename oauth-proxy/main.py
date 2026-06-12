import urllib.request
import urllib.parse
import os
import json

CLIENT_ID = os.environ.get("GH_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("GH_CLIENT_SECRET", "")
BASE_URL = os.environ.get("BASE_URL", "")


def handler(event, context):
    path = event.get("path", event.get("requestContext", {}).get("path", ""))
    params = {}
    qp = event.get("queryStringParameters") or {}
    mqp = event.get("multiValueQueryStringParameters") or {}
    params.update(qp)
    for k, v in mqp.items():
        if k not in params and v:
            params[k] = v[0] if isinstance(v, list) else v

    if path.endswith("auth"):
        return handle_auth(params)
    elif path.endswith("callback"):
        return handle_callback(params)
    elif path.endswith("debug"):
        return respond(200, json.dumps({
            "client_id": CLIENT_ID[:10] + "..." if CLIENT_ID else "NOT SET",
            "base_url": BASE_URL,
            "has_secret": bool(CLIENT_SECRET),
            "path": path,
        }))
    else:
        return respond(400, json.dumps({"path": path, "params": params}))


def handle_auth(params):
    provider = params.get("provider", "github")
    scope = params.get("scope", "repo")
    redirect_uri = params.get("redirect_uri", "")
    site_id = params.get("site_id", "")
    state = params.get("state", "")

    if not CLIENT_ID:
        return respond(500, "CLIENT_ID not configured")
    if not BASE_URL:
        return respond(500, "BASE_URL not configured")

    # Determine the final redirect target
    final_redirect = redirect_uri or ("https://" + site_id if site_id else "")

    # Build GitHub OAuth URL
    oauth_params = {
        "client_id": CLIENT_ID,
        "redirect_uri": BASE_URL.rstrip("/") + "/callback",
        "scope": scope,
        "state": json.dumps({"redirect": final_redirect, "state": state}),
    }
    gh_url = "https://github.com/login/oauth/authorize?" + urllib.parse.urlencode(oauth_params)
    return respond(302, "", headers={"Location": gh_url})


def handle_callback(params):
    code = params.get("code", "")
    state_raw = params.get("state", "{}")

    try:
        state_data = json.loads(state_raw) if state_raw else {}
    except json.JSONDecodeError:
        state_data = {"redirect": ""}

    redirect_to = state_data.get("redirect", "")

    if not code:
        return respond(400, "Missing code")

    # Exchange code for access token
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

    if not access_token:
        return respond(500, "No access_token: " + json.dumps(token_data))

    # Redirect popup to auth-callback page which sends token to parent via postMessage
    cms_url = redirect_to.rstrip("/") if redirect_to else "https://boxclub.website.yandexcloud.net"
    cms_url += "/admin/auth-callback.html"
    return respond(302, "", headers={"Location": f"{cms_url}#access_token={access_token}&provider=github"})


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
