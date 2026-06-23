import os
import sys
import hashlib
import hmac
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

key_id = os.environ["YC_KEY_ID"]
secret = os.environ["YC_SECRET"]
bucket = "boxclub"
region = "us-east-1"
service = "s3"

now = datetime.now(timezone.utc)
amz_date = now.strftime("%Y%m%dT%H%M%SZ")
date_stamp = now.strftime("%Y%m%d")
host = f"{bucket}.storage.yandexcloud.net"


def sign(k, m):
    return hmac.new(k, m.encode("utf-8"), hashlib.sha256).digest()


def get_sig(k, ds, r, s):
    return sign(sign(sign(sign(("AWS4" + k).encode(), ds), r), s), "aws4_request")


CACHE_IMMUTABLE = "public, max-age=31536000, immutable"
CACHE_REVALIDATE = "public, max-age=0, must-revalidate"


def get_cache_control(path):
    ext = path.suffix.lower()
    if ext in (".webp", ".png", ".jpg", ".jpeg", ".svg", ".ico", ".avif"):
        return CACHE_IMMUTABLE
    if ext in (".css", ".js", ".woff", ".woff2", ".ttf", ".otf", ".eot"):
        return CACHE_IMMUTABLE
    return CACHE_REVALIDATE


def s3_request(method, s3_path, body, content_type, query_string, cache_control=None):
    encoded_path = urllib.parse.quote(s3_path, safe="/")
    body_hash = hashlib.sha256(body).hexdigest()

    qs = query_string.lstrip("?") if query_string else ""

    cc = f"cache-control:{cache_control}\n" if cache_control else ""
    cc_signed = "cache-control;" if cache_control else ""

    canonical_headers = (
        f"host:{host}\n"
        f"{cc}"
        f"x-amz-content-sha256:{body_hash}\n"
        f"x-amz-date:{amz_date}\n"
    )
    signed_headers = f"host;{cc_signed}x-amz-content-sha256;x-amz-date"
    if content_type:
        canonical_headers = (
            f"host:{host}\n"
            f"content-type:{content_type}\n"
            f"{cc}"
            f"x-amz-content-sha256:{body_hash}\n"
            f"x-amz-date:{amz_date}\n"
        )
        signed_headers = f"host;content-type;{cc_signed}x-amz-content-sha256;x-amz-date"

    canonical_request = (
        f"{method}\n/{encoded_path}\n{qs}\n{canonical_headers}\n{signed_headers}\n{body_hash}"
    )
    credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
    string_to_sign = (
        f"AWS4-HMAC-SHA256\n{amz_date}\n{credential_scope}\n"
        f"{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
    )
    signing_key = get_sig(secret, date_stamp, region, service)
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()
    auth = (
        f"AWS4-HMAC-SHA256 Credential={key_id}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )

    url = f"https://{host}/{encoded_path}"
    if qs:
        url += "?" + qs

    headers = {
        "x-amz-date": amz_date,
        "x-amz-content-sha256": body_hash,
        "Authorization": auth,
    }
    if content_type:
        headers["Content-Type"] = content_type
    if cache_control:
        headers["Cache-Control"] = cache_control

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    return urllib.request.urlopen(req)


def s3_put(s3_path, file_path, content_type, cache_control=None):
    with open(file_path, "rb") as f:
        body = f.read()
    s3_request("PUT", s3_path, body, content_type, "", cache_control)


def s3_list_all():
    objects = []
    token = None
    while True:
        qs = "list-type=2"
        if token:
            qs += "&continuation-token=" + urllib.parse.quote(token, safe="")
        resp = s3_request("GET", "", b"", None, qs)
        root = ET.fromstring(resp.read())

        ns = {"s3": "http://s3.amazonaws.com/doc/2006-03-01/"}
        for contents in root.findall("s3:Contents", ns):
            key = contents.find("s3:Key", ns).text
            objects.append(key)

        is_truncated = root.find("s3:IsTruncated", ns)
        if is_truncated is not None and is_truncated.text == "true":
            token = root.find("s3:NextContinuationToken", ns)
            token = token.text if token is not None else None
        else:
            break
    return objects


def s3_delete_many(keys):
    CHUNK = 1000
    for i in range(0, len(keys), CHUNK):
        chunk = keys[i : i + CHUNK]
        root = ET.Element("Delete")
        for key in chunk:
            obj = ET.SubElement(root, "Object")
            k = ET.SubElement(obj, "Key")
            k.text = key
        body = ET.tostring(root, encoding="unicode")
        s3_request("POST", "", body.encode("utf-8"), "application/xml", "delete")
        for key in chunk:
            print(f"DEL  {key}")


import mimetypes

docs = Path("docs")

# Build set of expected S3 keys
local_keys = set()
upload_errors = 0
for path in sorted(docs.rglob("*")):
    if path.is_file():
        if path.suffix.lower() in (".jpg", ".jpeg", ".png"):
            webp_path = path.with_suffix(".webp")
            if webp_path.exists() and webp_path.name != path.name:
                print(f"SKIP {path.relative_to(docs)} (WebP exists)")
                continue
        s3_key = str(path.relative_to(docs))
        local_keys.add(s3_key)
        ct = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        cc = get_cache_control(path)
        try:
            s3_put(s3_key, str(path), ct, cc)
            print(f"OK   {s3_key}")
        except Exception as e:
            print(f"ERR  {s3_key}: {e}")
            upload_errors += 1

# Cleanup stale files in bucket (non-fatal, may lack ListBucket/DeleteObject permissions)
print("\n--- Checking for stale files ---")
try:
    remote_keys = s3_list_all()
    stale = [k for k in remote_keys if k not in local_keys]
    if stale:
        print(f"Found {len(stale)} stale file(s), deleting...")
        s3_delete_many(stale)
    else:
        print("No stale files found")
except Exception as e:
    print(f"Cleanup error (non-fatal): {e}")

print("Done")
if upload_errors:
    print(f"\nFAILED with {upload_errors} error(s)")
    sys.exit(1)
