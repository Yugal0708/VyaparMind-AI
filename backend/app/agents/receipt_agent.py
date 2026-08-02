import json
from google import genai
from google.genai import types
from app.core.config import settings

class ReceiptAgent:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def process_image(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
        prompt = """
        You are an expert MSME OCR receipt parsing agent for Indian Kirana & retail stores.
        Analyze this receipt/bill image and extract the store name, date, items (with name, quantity, unit price, total amount), and subtotal.
        """
        
        response = self.client.models.generate_content(
          model="gemini-3.5-flash-lite",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
                # Enforcing strict JSON schema for reliable hackathon demos
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "store_name": {"type": "STRING"},
                        "date": {"type": "STRING"},
                        "items": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "item_name": {"type": "STRING"},
                                    "quantity": {"type": "NUMBER"},
                                    "unit_price": {"type": "NUMBER"},
                                    "total_amount": {"type": "NUMBER"}
                                },
                                "required": ["item_name", "quantity", "unit_price", "total_amount"]
                            }
                        },
                        "subtotal": {"type": "NUMBER"}
                    },
                    "required": ["store_name", "date", "items", "subtotal"]
                }
            )
        )

        return json.loads(response.text)

receipt_agent = ReceiptAgent()