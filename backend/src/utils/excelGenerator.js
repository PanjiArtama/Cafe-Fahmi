import ExcelJS from 'exceljs';

export const generateOrdersExcel = async (orders, res, filename = "Report") => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Order Items Report');

    
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

    
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4A3728' } };

    let grandTotal = 0; 

    orders.forEach(order => {
        
        grandTotal += (order.totalAmount || 0);

        
        order.orderDetails.forEach((item, index) => {
            worksheet.addRow({
                id: order._id.toString(),
                date: new Date(order.orderDate).toLocaleString(),
                customer: order.userId ? order.userId.username : (order.guestName || 'Guest'),
                productName: item.productId?.name || 'Unknown Product',
                quantity: item.quantity,
                price: item.price,
                itemTotal: item.quantity * item.price,
                orderTotal: order.totalAmount,
                status: order.status.toUpperCase()
            });
        });
    });

    worksheet.addRow({});

    const totalRow = worksheet.addRow({
        itemTotal: 'GRAND TOTAL:', 
        orderTotal: grandTotal 
    });

    totalRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '005A9E' } }; 
    
    totalRow.getCell('itemTotal').alignment = { horizontal: 'right' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};