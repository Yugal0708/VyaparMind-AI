from google import genai
from app.core.config import settings

class AnalyticsAgent:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def generate_insights(self, receipt_data: dict, inventory_data: dict) -> dict:
        prompt = f"""
        Act as an expert Indian Marwari Business Advisor (Vyapar Guru) for an MSME shop owner.
        Analyze this bill data: {receipt_data}
        And this inventory data: {inventory_data}
        
        Provide advice in two languages in strict JSON format:
        1. "hindi_advice": Natural, street-smart Indian business Hindi (written in English script). Use words like 'Bhaiya', 'Munaafa', 'Stock khatam', 'Fayda'. Keep it to 2-3 lines. Example: "Bhaiya, tel aur daal ka naya stock aa gaya hai, ise jaldi nikalne par 15% munaafa banega."
        2. "english_advice": Professional corporate English summary.
        3. "action": One immediate business action to take (e.g., "Update ledger and push sales for oil.")
        
        Return ONLY valid JSON.
        """
        
        response = self.client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[prompt]
        )
        
        import json
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        return {
            "insight_hindi": data.get("hindi_advice", "Bhaiya, bill process ho gaya hai."),
            "insight_english": data.get("english_advice", "Bill processed successfully."),
            "action_item": data.get("action", "File the invoice."),
            "profit_estimate": int(receipt_data.get("grand_total", 0) * 0.15) # Rough 15% retail margin
        }

analytics_agent = AnalyticsAgent()