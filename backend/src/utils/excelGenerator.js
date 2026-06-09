import ExcelJS from 'exceljs';

export const generateOrdersExcel = async (orders, res, filename = "Report") => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Order Items Report');

    // Define Columns - We add Product Name and Item Price columns
    worksheet.columns = [
        { header: 'Order ID', key: 'id', width: 25 },
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Product Name', key: 'productName', width: 25 },
        { header: 'Qty', key: 'quantity', width: 10 },
        { header: 'Item Price', key: 'price', width: 15 },
        { header: 'Item Total', key: 'itemTotal', width: 15 },
        { header: 'Order Total (Final)', key: 'orderTotal', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
    ];

    // Style the Header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4A3728' } };

    orders.forEach(order => {
        // We loop through each item in the order
        order.orderDetails.forEach((item, index) => {
            worksheet.addRow({
                // We keep Order ID and Date on every row so the data is filterable
                id: order._id.toString(),
                date: new Date(order.orderDate).toLocaleString(),
                customer: order.userId ? order.userId.username : (order.guestName || 'Guest'),
                
                // Item specific data
                productName: item.productId?.name || 'Unknown Product',
                quantity: item.quantity,
                price: item.price,
                itemTotal: item.quantity * item.price,
                
                // Show the Order Total only on the first row of the order, 
                // or on every row if you want to perform easy math. 
                // Let's show it on every row for better data filtering.
                orderTotal: order.totalAmount,
                status: order.status.toUpperCase()
            });

            // Optional: Merge the Order ID cells for a cleaner look (Visual only)
            // This makes it look like a group, but can make filtering harder. 
            // Usually, for "Raw Data" exports, we don't merge.
        });
    });

    // Set Response Headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};