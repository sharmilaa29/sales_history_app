import frappe
import erpnext

@frappe.whitelist()
def get_last_5_sales(item_code):
        sales_item = frappe.db.sql("""
                SELECT SI.name, SI.posting_date, SI.customer, SII.rate, SII.qty, SII.amount
                FROM `tabSales Invoice Item` SII
                inner join `tabSales Invoice` SI on SI.name = SII.parent
                WHERE SII.item_code = %s and SI.docstatus = 1 and SI.is_return = 0 and SI.status != 'Credit Note Issued'
                order by SI.posting_date desc, SI.name desc
                limit 5
                """, (item_code,), as_dict=1)
        return sales_item