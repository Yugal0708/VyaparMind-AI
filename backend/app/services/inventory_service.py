

class DynamicInventoryStore:
    def __init__(self):
        # Stores inventory dynamically per session
        self.inventory = {}

    def sync_bill_items(self, extracted_items):
        """
        Dynamically syncs bill items into store inventory.
        No hardcoded Atta or Sarso Tel!
        """
        synced_list = []
        low_stock_alerts = []

        for item in extracted_items:
            name = item.get("name", "Item")
            qty = int(item.get("qty", 1))
            hsn = str(item.get("hsn", "N/A"))
            price = float(item.get("price", 0))

            if name in self.inventory:
                self.inventory[name]["current_stock"] += qty
            else:
                self.inventory[name] = {
                    "name": name,
                    "hsn": hsn,
                    "price": price,
                    "current_stock": qty,
                    "min_threshold": max(5, int(qty * 0.3)),  # Dynamic threshold
                }

            item_data = self.inventory[name]
            synced_list.append(item_data)

            if item_data["current_stock"] <= item_data["min_threshold"]:
                low_stock_alerts.append(item_data)

        return {
            "synced_items": synced_list,
            "low_stock_alerts": low_stock_alerts,
            "all_inventory": list(self.inventory.values())
        }

inventory_store = DynamicInventoryStore()