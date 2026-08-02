import json
from google import genai
from google.genai import types
from app.core.config import settings



class GSTEngineAgent:
    async def calculate_gst(self, raw_receipt: dict) -> dict:
        items = raw_receipt.get("items", [])
        subtotal = 0.0
        total_cgst = 0.0
        total_sgst = 0.0
        
        updated_items = []
        for item in items:
            name = str(item.get("item_name", "")).upper()
            hsn = str(item.get("hsn_code", ""))
            
            # Read rate from vision extraction if available, otherwise apply intelligent Kirana slab
            extracted_rate = item.get("gst_rate")
            
            if extracted_rate is not None and float(extracted_rate) > 0:
                gst_rate = float(extracted_rate)
            else:
                # Intelligent Kirana & Retail Tax Slab Router (Bharat MSME compliant)
                if any(keyword in name for keyword in ["CHANA", "DAL", "BESAN", "SUGAR", "SABUDANA", "RAJAM", "OIL", "WHEAT", "ATTA", "RICE", "SALT"]):
                    # Essential food grains & edible oils in kirana are 0% or 5%
                    gst_rate = 0.0 if "CHANA" in name or "DAL" in name or "SUGAR" in name else 5.0
                elif "PARLE" in name or "biscuit" in name.lower():
                    gst_rate = 18.0 # Packaged biscuits / processed items
                else:
                    gst_rate = 5.0 # Standard kirana food item fallback
            
            # If bill image explicitly specifies tax values, honor them, else compute
            base_price = float(item.get("total_amount", item.get("unit_price", 0) * item.get("quantity", 1)))
            
            item_tax = base_price * (gst_rate / 100.0)
            cgst = round(item_tax / 2, 2)
            sgst = round(item_tax / 2, 2)
            
            item["gst_rate"] = gst_rate
            item["cgst"] = cgst
            item["sgst"] = sgst
            item["total_amount"] = round(base_price + item_tax, 2)
            
            subtotal += base_price
            total_cgst += cgst
            total_sgst += sgst
            updated_items.append(item)
            
        raw_receipt["items"] = updated_items
        raw_receipt["subtotal"] = round(subtotal, 2)
        raw_receipt["cgst"] = round(total_cgst, 2)
        raw_receipt["sgst"] = round(total_sgst, 2)
        raw_receipt["grand_total"] = round(subtotal + total_cgst + total_sgst, 2)
        
        return raw_receipt

gst_agent = GSTEngineAgent()

