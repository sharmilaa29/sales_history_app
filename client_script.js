frappe.ui.form.on('Sales Order Item', {
    custom_info: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        var item_code = row.item_code;

        if (!item_code) {
            frappe.msgprint(__('Please select an item first.'));
            return;
        }

        var selling_details = [];

        const dialog = new frappe.ui.Dialog({
            title: __('Selling History'),
            size: 'extra-large',
            fields: [
                {
                    fieldtype: 'Table',
                    fieldname: 'selling_details',
                    fields: [
                        {
                            fieldtype: 'Link',
                            fieldname: 'invoice_no',
                            label: __('Inv No'),
                            options: 'Sales Invoice',
                            in_list_view: 1,
                            columns: 2,
                            read_only: 1
                        },
                        {
                            fieldtype: 'Date',
                            fieldname: 'invoice_date',
                            label: __('Date'),
                            in_list_view: 1,
                            columns: 2,
                            read_only: 1
                        },
                        {
                            fieldtype: 'Link',
                            fieldname: 'customer_code',
                            label: __('Customer'),
                            options: 'Customer',
                            in_list_view: 1,
                            columns: 2,
                            read_only: 1
                        },
                        {
                            fieldtype: 'Currency',
                            fieldname: 'rate',
                            label: __('Rate'),
                            in_list_view: 1,
                            columns: 1,
                            read_only: 1
                        },
                        {
                            fieldtype: 'Float',
                            fieldname: 'qty',
                            label: __('Qty'),
                            in_list_view: 1,
                            columns: 1,
                            read_only: 1
                        },
                        {
                            fieldtype: 'Currency',
                            fieldname: 'amount',
                            label: __('Amount'),
                            in_list_view: 1,
                            columns: 1,
                            read_only: 1
                        },
                        {
                            fieldtype: 'Button',
                            fieldname: 'use',
                            label: __('Use'),
                            in_list_view: 1,
                            columns: 1
                        }
                    ],
                    data: selling_details,
                    in_place_edit: false,
                    get_data: function () {
                        return selling_details;
                    }
                }
            ],
            primary_action_label: "Close",
            primary_action: function () {
                dialog.hide();
            }
        });

        frappe.call({
            method: "sales_history_app.custom_script.get_last_5_sales",
            args: { item_code: item_code },
            callback: function (r) {
                if (r.message) {
                    selling_details.length = 0;
                    r.message.forEach(function (d) {
                        selling_details.push({
                            invoice_no: d.name,
                            invoice_date: d.posting_date,
                            customer_code: d.customer,
                            rate: d.rate,
                            qty: d.qty,
                            amount: d.amount
                        });
                    });

                    dialog.fields_dict.selling_details.grid.refresh();
                    setup_use_button_event(dialog, frm, cdt, cdn);
                }
            }
        });

        dialog.show();
    }
});

function setup_use_button_event(dialog, frm, cdt, cdn) {
    dialog.fields_dict.selling_details.grid.wrapper[0].addEventListener('click', function (event) {
        var $target = $(event.target);
        var $row = $target.closest('.grid-row');
        var grid_row = $row.data('grid_row');

        if (grid_row && grid_row.doc && $target.attr('data-fieldname') === 'use') {
            var selected_rate = grid_row.doc.rate;
            var item_code = frappe.model.get_value(cdt, cdn, 'item_code');
            frappe.model.set_value(cdt, cdn, 'price_list_rate', selected_rate);
            frappe.model.set_value(cdt, cdn, 'rate', selected_rate);

            frappe.msgprint(__('Rate {0} has been set for Item {1}', [selected_rate, item_code]));

            frm.refresh_field('items');
            dialog.hide();
        }
    }, true);
}