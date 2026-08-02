
from app.services.inventory_service import inventory_store

class InventoryAgent:
    async def process(self, extracted_bill_data):
        items = extracted_bill_data.get("items", [])
        sync_result = inventory_store.sync_bill_items(items)
        return sync_result

inventory_agent = InventoryAgent()