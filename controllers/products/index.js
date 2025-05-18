// controllers/product.controller.js
const db = require('../../config/database');

const getProductsByFilter = async (req, res) => {
    try {
        const { context, min_price, max_price, category_id, store_id } = req.body;

        let query = `SELECT * FROM product WHERE 1 = 1`;
        const params = [];

        if (context) {
        query += ` AND (name LIKE ? OR description LIKE ?)`;
        const keyword = `%${context}%`;
        params.push(keyword, keyword);
        }

        if (min_price) {
        query += ` AND price >= ?`;
        params.push(min_price);
        }

        if (max_price) {
        query += ` AND price <= ?`;
        params.push(max_price);
        }

        if (category_id) {
        query += ` AND category_id = ?`;
        params.push(category_id);
        }

        if (store_id) {
        query += ` AND store_id = ?`;
        params.push(store_id);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Lỗi khi lọc sản phẩm:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

module.exports = { getProductsByFilter };
