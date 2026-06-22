import os
import json
import base64
import hashlib
import hmac
import time
import urllib.request
import io
from collections import defaultdict
from PIL import Image

GH_PAT = os.environ.get("GH_PAT", "")
BASE_URL = os.environ.get("BASE_URL", "")
ADMIN_PASS_HASH = os.environ.get("ADMIN_PASS_HASH", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_EXPIRY = 1800
GH_OWNER = "Alexey-Andreev-93"
GH_REPO = "boxclub"
GH_BRANCH = "main"

ALLOWED_UPLOAD_FOLDERS = {"gallery", "reviews", "hero", "trainer"}
ALLOWED_ORIGINS = {
    "https://boxclub.website.yandexcloud.net",
    "https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net",
}

RATE_LIMITS = defaultdict(lambda: [0, 0.0])


def is_rate_limited(event):
    ip = event.get("requestContext", {}).get("sourceIp", "unknown")
    record = RATE_LIMITS[ip]
    now = time.time()
    if now - record[1] > 60:
        RATE_LIMITS[ip] = [1, now]
        return False
    if record[0] >= 15:
        return True
    record[0] += 1
    return False


def handler(event, context):
    path = event.get("path", event.get("requestContext", {}).get("path", ""))
    method = event.get("httpMethod", event.get("requestContext", {}).get("method", "GET"))

    if is_rate_limited(event):
        return respond(429, json.dumps({"error": "Too many requests"}), event)

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

    headers = event.get("headers", {}) or {}
    auth_header = headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        params["_token"] = auth_header[7:]

    if method == "OPTIONS":
        return respond(200, json.dumps({"ok": True}), event)

    if path.endswith("admin/login"):
        return handle_admin_login(params, event)
    elif path.endswith("admin/save"):
        return handle_admin_save(params, event)
    elif path.endswith("admin/upload"):
        return handle_admin_upload(params, event)
    else:
        return respond(400, json.dumps({"path": path, "params": params}), event)


def verify_password(password):
    if not ADMIN_PASS_HASH:
        return False
    pwd_hash = hashlib.sha256(password.encode()).hexdigest()
    return hmac.compare_digest(pwd_hash, ADMIN_PASS_HASH)


def verify_token(token):
    if not JWT_SECRET:
        return False
    parts = token.split(".")
    if len(parts) != 3:
        return False
    header_b64, payload_b64, signature = parts
    expected = hmac.new(
        JWT_SECRET.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return False
    try:
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        data = json.loads(base64.urlsafe_b64decode(payload_b64))
    except Exception:
        return False
    if time.time() > data.get("exp", 0):
        return False
    return True


def handle_admin_login(params, event):
    password = params.get("password", "")
    if not verify_password(password):
        return respond(401, json.dumps({"error": "Неверный пароль"}), event)
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "HS256"}).encode()
    ).rstrip(b"=").decode()
    payload = base64.urlsafe_b64encode(
        json.dumps({"exp": int(time.time()) + JWT_EXPIRY}).encode()
    ).rstrip(b"=").decode()
    signature = hmac.new(
        JWT_SECRET.encode(),
        f"{header}.{payload}".encode(),
        hashlib.sha256
    ).hexdigest()
    token = f"{header}.{payload}.{signature}"
    return respond(200, json.dumps({"success": True, "token": token}), event)


def handle_admin_save(params, event):
    files = params.get("files", [])
    token = params.get("token", params.get("_token", ""))

    if not verify_token(token):
        return respond(401, json.dumps({"error": "Сессия истекла"}), event)
    if not GH_PAT:
        return respond(500, json.dumps({"error": "GH_PAT not configured"}), event)

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

            request_body = json.dumps({
                "message": "Updated via admin",
                "content": base64.b64encode(content.encode()).decode(),
                "sha": sha,
                "branch": GH_BRANCH,
            })
            req = urllib.request.Request(url, data=request_body.encode(), headers=headers, method="PUT")
            urllib.request.urlopen(req)
            results.append({"path": path, "success": True})
        except Exception as e:
            results.append({"path": path, "success": False, "error": str(e)})

    return respond(200, json.dumps({"success": True, "results": results}), event)


def handle_admin_upload(params, event):
    filename = params.get("filename", "")
    data = params.get("data", "")
    folder = params.get("folder", "gallery")
    token = params.get("token", params.get("_token", ""))

    if not verify_token(token):
        return respond(401, json.dumps({"error": "Сессия истекла"}), event)
    if folder not in ALLOWED_UPLOAD_FOLDERS:
        return respond(400, json.dumps({"error": "Invalid folder"}), event)
    if not filename or ".." in filename or "/" in filename:
        return respond(400, json.dumps({"error": "Invalid filename"}), event)
    if not data:
        return respond(400, json.dumps({"error": "data required"}), event)

    if "," in data:
        data = data.split(",")[1]

    try:
        img_bytes = base64.b64decode(data)
        img = Image.open(io.BytesIO(img_bytes))
        output = io.BytesIO()
        img.convert("RGB").save(output, "WEBP", quality=85)
        data = base64.b64encode(output.getvalue()).decode()
        filename = os.path.splitext(filename)[0] + ".webp"
    except Exception:
        return respond(400, json.dumps({"error": "Файл не является изображением"}), event)

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

        request_body = json.dumps({
            "message": f"Upload {filename} via admin",
            "content": data,
            "sha": sha,
            "branch": GH_BRANCH,
        })
        req = urllib.request.Request(url, data=request_body.encode(), headers=gh_headers, method="PUT")
        urllib.request.urlopen(req)
        return respond(200, json.dumps({"success": True, "url": f"/images/{folder}/{filename}"}), event)
    except Exception as e:
        return respond(500, json.dumps({"error": str(e)}), event)


def respond(code, body, event=None):
    h = {"Content-Type": "application/json"}
    h["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"

    if event:
        origin = (event.get("headers", {}) or {}).get("origin", "")
        if origin in ALLOWED_ORIGINS:
            h["Access-Control-Allow-Origin"] = origin

    if code == 302:
        h.pop("Content-Type", None)
    return {
        "statusCode": code,
        "headers": h,
        "body": str(body),
        "isBase64Encoded": False,
    }
