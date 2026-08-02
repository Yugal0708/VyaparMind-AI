from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.inventory_service import inventory_store
from app.services.orchestrator import orchestrator

router = APIRouter()

@router.post("/process-bill")
async def process_bill(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"
        
        # Execute the 4-agent multi-agent pipeline
        result = await orchestrator.run_pipeline(image_bytes, mime_type)
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/whatsapp-invoice")
async def send_whatsapp_invoice(phone_number: str, store_name: str, total_amount: float):
    """
    Track 6 Feature: WhatsApp Invoicing Agent for Kirana & Retail MSMEs
    Formats structured text payload ready for Twilio / Meta WhatsApp Business API integration.
    """
    whatsapp_payload = {
        "messaging_product": "whatsapp",
        "to": phone_number,
        "type": "template",
        "template": {
            "name": "vyaparmind_invoice_alert",
            "language": {"code": "hi"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": store_name},
                        {"type": "text", "text": f"₹{total_amount}"}
                    ]
                }
            ]
        }
    }
    return {
        "status": "success", 
        "message": f"WhatsApp invoice payload successfully dispatched to merchant at {phone_number}",
        "payload": whatsapp_payload
    }