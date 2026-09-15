# Stub for OCR processing using pytesseract
import pytesseract
try:
    from PIL import Image
except ImportError:
    pass

def extract_text_from_image(image_path: str) -> str:
    """
    Extracts text from screenshots using Tesseract OCR.
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""
