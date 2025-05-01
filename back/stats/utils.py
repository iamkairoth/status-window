from xata.client import XataClient
import os

def get_xata_client():
    return XataClient(
        api_key=os.getenv("XATA_API_KEY"),
        db_url=os.getenv("XATA_DB_URL")
    )