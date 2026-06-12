import os
import json

GH_PAT = os.environ.get("GH_PAT", "")
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
    else:
        return respond(400, json.dumps({"path": path, "params": params}))


def handle_auth(params):
    site_id = params.get("site_id", "")

    if not GH_PAT:
        return respond(500, "GH_PAT not configured")
    if not BASE_URL:
        return respond(500, "BASE_URL not configured")

    cms_url = ("https://" + site_id if site_id else "https://boxclub.website.yandexcloud.net")
    cms_url = cms_url.rstrip("/") + "/admin/auth-callback.html"
    return respond(302, "", headers={"Location": f"{cms_url}#access_token={GH_PAT}&provider=github"})


def handle_callback(params):
    return respond(200, "PAT mode — no OAuth callback needed")


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
