import os
import json
import base64
import hashlib
import urllib.request

GH_PAT = os.environ.get("GH_PAT", "")
BASE_URL = os.environ.get("BASE_URL", "")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH", "")
GH_OWNER = "Alexey-Andreev-93"
GH_REPO = "boxclub"
GH_BRANCH = "main"


def handler(event, context):
    path = event.get("path", event.get("requestContext", {}).get("path", ""))
    method = event.get("httpMethod", event.get("requestContext", {}).get("method", "GET"))
    params = {}
    qp = event.get("queryStringParameters") or {}
    mqp = event.get("multiValueQueryStringParameters") or {}
    params.update(qp)
    for k, v in mqp.items():
        if k not in params and v:
            params[k] = v[0] if isinstance(v, list) else v

    if method == "POST":
        try:
            body = json.loads(event.get("body", "{}"))
            params.update(body)
        except (json.JSONDecodeError, TypeError):
            pass

    if path.endswith("admin/login"):
        return handle_admin_login(params)
    elif path.endswith("admin/save"):
        return handle_admin_save(params)
    elif path.endswith("admin/upload"):
        return handle_admin_upload(params, event)
    else:
        return respond(400, json.dumps({"path": path, "params": params}))


def handle_admin_login(params):
    password = params.get("password", "")
    if not ADMIN_PASS_HASH:
        return respond(500, "Admin password not configured")
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    if pwd_hash != ADMIN_PASS_HASH:
        return respond(401, json.dumps({"error": "Неверный пароль"}))
    return respond(200, json.dumps({"success": True}))


def handle_admin_save(params):
    password = params.get("password", "")
    files = params.get("files", [])

    if not ADMIN_PASS_HASH:
        return respond(500, json.dumps({"error": "Admin password not configured"}))
    if hashlib.sha256(password.encode()).hexdigest() != ADMIN_PASS_HASH:
        return respond(401, json.dumps({"error": "Неверный пароль"}))
    if not GH_PAT:
        return respond(500, json.dumps({"error": "GH_PAT not configured"}))

    headers = {
        "Authorization": f"Bearer {GH_PAT}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "boxclub-admin",
    }
    api = f"https://api.github.com/repos/{GH_OWNER}/{GH_REPO}"
    results = []

    for file in files:
        path = file.get("path", "")
        content = file.get("content", "")
        try:
            url = f"{api}/contents/{path}"
            req = urllib.request.Request(url, headers=headers)
            try:
                resp = urllib.request.urlopen(req)
                data = json.loads(resp.read())
                sha = data["sha"]
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    sha = None
                else:
                    raise

            body = json.dumps({
                "message": "Updated via admin",
                "content": base64.b64encode(content.encode()).decode(),
                "sha": sha,
                "branch": GH_BRANCH,
            })
            req = urllib.request.Request(url, data=body.encode(), headers=headers, method="PUT")
            urllib.request.urlopen(req)
            results.append({"path": path, "success": True})
        except Exception as e:
            results.append({"path": path, "success": False, "error": str(e)})

    return respond(200, json.dumps({"success": True, "results": results}))


def handle_admin_upload(params, event):
    password = params.get("password", "")
    filename = params.get("filename", "")
    data = params.get("data", "")
    folder = params.get("folder", "gallery")

    if hashlib.sha256(password.encode()).hexdigest() != ADMIN_PASS_HASH:
        return respond(401, json.dumps({"error": "Неверный пароль"}))
    if not filename:
        return respond(400, json.dumps({"error": "filename required"}))
    if not data:
        return respond(400, json.dumps({"error": "data required"}))

    # Remove data URL prefix if present (e.g. "data:image/png;base64,")
    if "," in data:
        data = data.split(",")[1]

    filepath = f"public/images/{folder}/{filename}"

    gh_headers = {
        "Authorization": f"Bearer {GH_PAT}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "boxclub-admin",
    }
    api = f"https://api.github.com/repos/{GH_OWNER}/{GH_REPO}"

    try:
        url = f"{api}/contents/{filepath}"
        req = urllib.request.Request(url, headers=gh_headers)
        try:
            resp = urllib.request.urlopen(req)
            existing = json.loads(resp.read())
            sha = existing["sha"]
        except urllib.error.HTTPError as e:
            if e.code == 404:
                sha = None
            else:
                raise

        body = json.dumps({
            "message": f"Upload {filename} via admin",
            "content": data,
            "sha": sha,
            "branch": GH_BRANCH,
        })
        req = urllib.request.Request(url, data=body.encode(), headers=gh_headers, method="PUT")
        urllib.request.urlopen(req)
        return respond(200, json.dumps({"success": True, "url": f"/images/{folder}/{filename}"}))
    except Exception as e:
        return respond(500, json.dumps({"error": str(e)}))


def respond(code, body, headers=None):
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    if code == 302:
        h.pop("Content-Type", None)
        h["Access-Control-Allow-Origin"] = "*"
    return {
        "statusCode": code,
        "headers": h,
        "body": str(body),
        "isBase64Encoded": False,
    }
