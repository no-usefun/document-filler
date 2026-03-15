import os
from urllib.parse import quote_plus
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_client = None
_db     = None

DB_NAME = "xmlpdfapp"


def get_db():
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/xmlpdfapp")

        # Auto-encode special characters in Atlas password
        if "mongodb+srv://" in uri and "@" in uri:
            try:
                scheme_end = uri.index("://") + 3
                at_pos     = uri.rindex("@", scheme_end)
                userinfo   = uri[scheme_end:at_pos]
                rest       = uri[at_pos:]
                if ":" in userinfo:
                    username, password = userinfo.split(":", 1)
                    if "%" not in password:
                        password = quote_plus(password)
                    if "%" not in username:
                        username = quote_plus(username)
                    uri = f"mongodb+srv://{username}:{password}{rest}"
            except Exception:
                pass

        _client = MongoClient(uri, serverSelectionTimeoutMS=10000)

        # Always use DB_NAME directly — never rely on URI default database
        _db = _client[DB_NAME]

        # Test connection
        try:
            _client.admin.command("ping")
            print(f"✓ MongoDB connected to '{DB_NAME}'")
        except Exception as e:
            print(f"✗ MongoDB connection failed: {e}")
            raise

    return _db