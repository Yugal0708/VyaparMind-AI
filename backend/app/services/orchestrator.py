import time
from app.agents.receipt_agent import receipt_agent
from app.agents.gst_agent import gst_agent
from app.agents.inventory_agent import inventory_agent
from app.agents.analytics_agent import analytics_agent

class MultiAgentOrchestrator:
    async def run_pipeline(self, image_bytes: bytes, mime_type: str) -> dict:
        start_time = time.time()

        # Step 1: Vision Extraction Agent
        raw_receipt = await receipt_agent.process_image(image_bytes, mime_type)

        # Step 2: GST & HSN Tax Engine
        taxed_receipt = await gst_agent.calculate_gst(raw_receipt)

        # Step 3: Dynamic Inventory Agent (No more hardcoded Atta!)
        inv_result = await inventory_agent.process(taxed_receipt)

        # Step 4: Analytics & Advisory Agent
        insights = await analytics_agent.generate_insights(taxed_receipt, inv_result)

        total_duration = round(time.time() - start_time, 2)

        # Transform data to EXACTLY match the new modern React UI schema
        return {
            "extracted_bill": {
                "vendor": taxed_receipt.get("store_name", "Unknown Vendor"),
                "items": [
                    {
                        "name": i.get("item_name", "Item"),
                        "hsn": i.get("hsn_code", "N/A"),
                        "qty": i.get("quantity", 0),
                        "price": i.get("unit_price", 0),
                        "gst": f"{i.get('gst_rate', 0)}%",
                        "total": i.get("total_amount", 0)
                    } for i in taxed_receipt.get("items", [])
                ],
                "subtotal": taxed_receipt.get("subtotal", 0),
                "tax": round(taxed_receipt.get("cgst", 0) + taxed_receipt.get("sgst", 0), 2),
                "grand_total": taxed_receipt.get("grand_total", 0)
            },
            "inventory_sync": {
                "synced_items": inv_result.get("synced_items", []),
                "low_stock_alerts": inv_result.get("low_stock_alerts", [])
            },
            "hindi_advice": {
                "hindi": insights.get("insight_hindi", "Analysis complete."),
                "english": insights.get("insight_english", "Analysis complete."),
                "estimated_profit": insights.get("profit_estimate", 0),
                "action": insights.get("action_item", "Review bill")
            },
            "execution_time": total_duration
        }

orchestrator = MultiAgentOrchestrator()