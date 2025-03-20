frappe.ui.form.on('Sales Order Item', {
    custom_info: function (frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        var item_code = row.item_code;

        if (!item_code) {
            frappe.msgprint(__('Please select an item first.'));
            return;
        }

        const dialog = new frappe.ui.Dialog({
            title: __('Selling History'),
            size: 'extra-large',
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'selling_history_table'
                }
            ],
            primary_action_label: "Close",
            primary_action: function () {
                dialog.hide();
            }
        });
        dialog.show();

        frappe.call({
            method: "spokes_service_app.custom_script.get_last_5_sales",
            args: { item_code: item_code },
            callback: function (r) {
                if (r.message) {
                    let table_html = `
                        <div style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Inv No</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Rate</th>
                                        <th>Qty</th>
                                        <th>Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;

                    r.message.forEach(function (d) {
                        let formatted_date = formatDate(d.posting_date);
                        table_html += `
                            <tr>
                                <td>${d.name}</td>
                                <td>${formatted_date}</td>
                                <td>${d.customer}</td>
                                <td>${d.rate}</td>
                                <td>${d.qty}</td>
                                <td>${d.amount}</td>
                                <td><button class="btn btn-primary use-rate" data-rate="${d.rate}">Use</button></td>
                            </tr>
                        `;
                    });

                    table_html += `</tbody></table></div>`;

                    dialog.fields_dict.selling_history_table.$wrapper.html(table_html);
                    setup_use_button_event(dialog, frm, cdt, cdn);
                }
            }
        });
    }
});

function setup_use_button_event(dialog, frm, cdt, cdn) {
    dialog.fields_dict.selling_history_table.$wrapper.on('click', '.use-rate', function () {
        var selected_rate = $(this).data('rate');
        var item_code = frappe.model.get_value(cdt, cdn, 'item_code');

        frappe.model.set_value(cdt, cdn, 'price_list_rate', selected_rate);
        frappe.model.set_value(cdt, cdn, 'rate', selected_rate);

        frappe.msgprint(__('Rate {0} has been set for Item {1}', [selected_rate, item_code]));

        frm.refresh_field('items');
        dialog.hide();
    });
}

function formatDate(dateString) {
    return dateString.split('-').reverse().join('-');
}
