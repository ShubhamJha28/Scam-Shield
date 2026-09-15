# Stub for QR code processing using pyzbar
import urllib.parse
try:
    from pyzbar.pyzbar import decode
    from PIL import Image
except ImportError:
    pass

def extract_upi_from_qr(image_path: str) -> dict:
    """
    Decodes a QR code and parses the upi://pay string.
    """
    try:
        image = Image.open(image_path)
        decoded_objects = decode(image)
        for obj in decoded_objects:
            data = obj.data.decode('utf-8')
            if data.startswith('upi://pay'):
                parsed = urllib.parse.urlparse(data)
                qs = urllib.parse.parse_qs(parsed.query)
                return {
                    "vpa": qs.get("pa", [""])[0],
                    "payee_name": qs.get("pn", [""])[0],
                    "amount": qs.get("am", [""])[0],
                    "is_prefilled_amount": "am" in qs,
                    "raw_url": data
                }
        return {"error": "No UPI QR code found."}
    except Exception as e:
        print(f"QR Error: {e}")
        return {"error": str(e)}
