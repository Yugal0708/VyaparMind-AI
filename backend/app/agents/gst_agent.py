

class GSTEngineAgent:
    def _clean(self, val):
        """Removes all commas and rupees signs so Math never fails"""
        if not val: return 0.0
        c = "".join(x for x in str(val) if x.isdigit() or x == '.')
        if c.count('.') > 1: c = c.replace('.', '', c.count('.') - 1)
        try: return float(c) if c else 0.0
        except: return 0.0

    async def calculate_gst(self, receipt: dict) -> dict:
        items = receipt.get("items", [])
        tot_tax = 0.0
        tot_sum = 0.0
        
        for i in items:
            # Extract and Clean Data
            name = str(i.get("name", i.get("item_name", "ITEM"))).upper()
            qty = self._clean(i.get("qty", i.get("quantity", 1))) or 1.0
            price = self._clean(i.get("price", i.get("unit_price", 0)))
            
            it_tot = self._clean(i.get("total", i.get("total_amount", 0)))
            if it_tot <= 0: it_tot = qty * price
            
            tax_v = self._clean(i.get("tax_amount", i.get("tax", 0)))
            
            # Inclusive Tax Logic (Tax is extracted FROM total, not added)
            if tax_v == 0 and it_tot > 0:
                rate = 5.0
                if any(k in name for k in ["CHANA", "DAL", "SUGAR", "SALT", "RICE", "WHEAT", "ATTA", "MASOOR", "UDAD", "BESAN"]): 
                    rate = 0.0
                elif any(k in name for k in ["PARLE", "BISCUIT", "SOAP"]): 
                    rate = 18.0
                
                if rate > 0: 
                    tax_v = round(it_tot - (it_tot / (1 + (rate / 100.0))), 2)

            i["gst"] = f"₹{tax_v}" if tax_v > 0 else "0%"
            i["tax_amount"] = tax_v
            i["qty"] = qty
            i["price"] = price
            i["total"] = round(it_tot, 2)
            i["name"] = name  # Force set name for frontend
            
            tot_tax += tax_v
            tot_sum += it_tot

        # Finalize Totals
        ext_g = self._clean(receipt.get("grand_total", 0))
        fg = ext_g if abs(ext_g - tot_sum) < 100 and ext_g > 0 else tot_sum
        sub = round(fg - tot_tax, 2)
        
        # Force set all totals for frontend
        receipt["tax"] = round(tot_tax, 2)
        receipt["tax_amount"] = round(tot_tax, 2)
        receipt["total_tax"] = round(tot_tax, 2)
        
        receipt["grand_total"] = round(fg, 2)
        receipt["total_amount"] = round(fg, 2)
        receipt["total"] = round(fg, 2)
        
        receipt["subtotal"] = sub
        
        return receipt

gst_agent = GSTEngineAgent()