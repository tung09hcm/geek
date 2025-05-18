require('dotenv').config();
const express = require("express");

const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/order");

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({ limit: "5mb" }));
app.use('/categories',categoryRoutes);
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
