const db = require('../../config/database');
const nodemailer = require('nodemailer');
const addOrder = async (req, res) => {
    const connection = await db.getConnection(); 
    await connection.beginTransaction();
    try {
        const { user_id, address_id, products } = req.body;

        // 1. Validate products
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'Products list cannot be empty' });
        }

        // 2. Tính tổng giá đơn hàng
        let total_price = 0;

        for (const item of products) {
            const [rows] = await connection.query(
                'SELECT price, stock_quantity FROM product WHERE product_id = ?',
                [item.product_id]
            );

            if (rows.length === 0) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            const product = rows[0];
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.product_id}`);
            }

            total_price += product.price * item.quantity;
        }

        // 3. Tạo đơn hàng
        const [orderResult] = await connection.query(
            `INSERT INTO \`order\` (user_id, address_id, status, total_price)
             VALUES (?, ?, 'Pending', ?)`,
            [user_id, address_id, total_price]
        );

        const order_id = orderResult.insertId;

        // 4. Ghi vào order_has_product
        for (const item of products) {
            await connection.query(
                `INSERT INTO order_has_product (order_id, product_id, quantity)
                 VALUES (?, ?, ?)`,
                [order_id, item.product_id, item.quantity]
            );

            // Cập nhật tồn kho
            await connection.query(
                `UPDATE product SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();

        res.status(201).json({ message: 'Order created successfully', order_id });

        
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Server error' });
    }
}
const sendOrderConfirmation = async (req, res) => {
    const orderId = req.params.id;

    try {
        const [orderResult] = await db.execute(`
            SELECT o.order_id, o.total_price, o.created_at, u.email, u.name
            FROM \`order\` o
            JOIN user u ON o.user_id = u.user_id
            WHERE o.order_id = ?
        `, [orderId]);

        if (orderResult.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult[0];

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,        
                pass: process.env.EMAIL_PASSWORD     
            }
        });

        // Tạo nội dung email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.email,
            subject: `Order Confirmation - Order #${order.order_id}`,
            html: `
                <h3>Hello ${order.name},</h3>
                <p>Thank you for your purchase! Here are your order details:</p>
                <ul>
                    <li>Order ID: ${order.order_id}</li>
                    <li>Total Price: $${order.total_price}</li>
                    <li>Order Date: ${new Date(order.created_at).toLocaleString()}</li>
                </ul>
                <p>We appreciate your business!</p>
            `
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: `Confirmation email sent to ${order.email}` });

    } catch (error) {
        console.error('Error sending confirmation email:', error);
        res.status(500).json({ error: 'Failed to send confirmation email' });
    }
};
module.exports = { addOrder, sendOrderConfirmation };