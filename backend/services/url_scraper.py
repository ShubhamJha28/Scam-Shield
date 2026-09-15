import requests
from bs4 import BeautifulSoup
import re

def scrape_url_content(url: str) -> str:
    """
    Visits a URL and extracts the visible text for LLM analysis.
    Returns the extracted text, or an error message if the scrape fails.
    """
    if not url.startswith("http"):
        url = "http://" + url
        
    try:
        # Provide a standard browser User-Agent to avoid basic bot-blocks
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        # Set a short timeout because scam sites can be unresponsive or honeypots
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style", "meta", "noscript"]):
            script.decompose()
            
        # Extract text
        text = soup.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        
        return text[:3000] # Cap at 3000 chars to avoid overloading the LLM context
        
    except requests.exceptions.RequestException as e:
        return f"Error scraping URL: {str(e)}"
    except Exception as e:
        return f"Failed to parse page content: {str(e)}"
