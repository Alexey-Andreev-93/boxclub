import os
import hashlib
import hmac
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

key_id = os.environ["YC_KEY_ID"]
secret = os.environ["YC_SECRET"]
bucket = "boxclub"
region = "us-east-1"
service = "s3"


def sign(k, m):
    return hmac.new(k, m.encode("utf-8"), hashlib.sha256).digest()


def get_sig(k, ds, r, s):
    return sign(sign(sign(sign(("AWS4" + k).encode(), ds), r), s), "aws4_request")


now = datetime.now(timezone.utc)
amz_date = now.strftime("%Y%m%dT%H%M%SZ")
date_stamp = now.strftime("%Y%m%d")
host = f"{bucket}.storage.yandexcloud.net"


def s3_put(s3_path, file_path, content_type):
    with open(file_path, "rb") as f:
        body = f.read()
    encoded_path = urllib.parse.quote(s3_path, safe="/")
    body_hash = hashlib.sha256(body).hexdigest()

    canonical_headers = (
        f"host:{host}\n"
        f"content-type:{content_type}\n"
        f"x-amz-content-sha256:{body_hash}\n"
        f"x-amz-date:{amz_date}\n"
    )
    signed_headers = "host;content-type;x-amz-content-sha256;x-amz-date"
    canonical_request = (
        f"PUT\n/{encoded_path}\n\n{canonical_headers}\n{signed_headers}\n{body_hash}"
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

    req = urllib.request.Request(
        f"https://{host}/{encoded_path}",
        data=body,
        headers={
            "Content-Type": content_type,
            "x-amz-date": amz_date,
            "x-amz-content-sha256": body_hash,
            "Authorization": auth,
        },
        method="PUT",
    )
    urllib.request.urlopen(req)


mime_map = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".xml": "application/xml",
}

docs = Path("docs")
for path in sorted(docs.rglob("*")):
    if path.is_file():
        # Skip unused JPG originals (keep only WebP)
        if path.suffix.lower() in (".jpg", ".jpeg", ".png") and path.suffix.lower() != ".webp":
            webp_path = path.with_suffix(".webp")
            if webp_path.exists():
                print(f"SKIP {path.relative_to(docs)} (WebP exists)")
                continue
        s3_key = str(path.relative_to(docs))
        ct = mime_map.get(path.suffix.lower(), "application/octet-stream")
        try:
            s3_put(s3_key, str(path), ct)
            print(f"OK   {s3_key}")
        except Exception as e:
            print(f"ERR  {s3_key}: {e}")

print("Done")
