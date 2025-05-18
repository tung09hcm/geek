const db = require('../../config/database');
const getAllCategories = async(req,res) => {
    try {
        const [rows] = await db.query('SELECT * FROM category');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
}
const getAllProductsByCategory = async(req,res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM product WHERE category_id = ?', [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching products by category' });
    }
}

module.exports = {getAllCategories , getAllProductsByCategory};