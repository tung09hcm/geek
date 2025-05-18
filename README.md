Dưới đây là một **README outline** giúp bạn trình bày đầy đủ và rõ ràng câu trả lời cho các phần từ (a) đến (f):

---

# 🛍️ E-Commerce Platform Database & API Design

## 📋 Table of Contents

* [Overview](#overview)
* [A. Relational Database Design](#a-relational-database-design)

  * [Tables and Relationships](#tables-and-relationships)
  * [Normalization](#normalization)
* [B. Sample Order Insertion](#b-sample-order-insertion)
* [C. Monthly Average Order Value](#c-monthly-average-order-value)
* [D. Customer Churn Rate Calculation](#d-customer-churn-rate-calculation)
* [E. RESTful API Specifications](#e-restful-api-specifications)
* [F. API Implementation](#f-api-implementation)

  * [Tech Stack](#tech-stack)
  * [Setup Instructions](#setup-instructions)
  * [Running the Server](#running-the-server)


---

## 🧾 Overview


---

## A. Relational Database Design

### Tables and Relationships

```sql
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    password_hash VARCHAR(255),
    email VARCHAR(100),
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
)

CREATE TABLE store (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(user_id)
)

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    discount_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2),
    stock_quantity INT,
    category_id INT,
    store_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(category_id),
    FOREIGN KEY (store_id) REFERENCES store(store_id)
)

CREATE TABLE product_img (
    img_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    img_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
)

CREATE TABLE voucher (
    voucher_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50),
    discount_rate DECIMAL(5, 2),
    expiration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE order (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_id INT,
    status VARCHAR(50),
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (address_id) REFERENCES address(address_id)
)

CREATE TABLE user_has_address (
    id_address INT,
    user_id INT,
    PRIMARY KEY (id_address, user_id),
    FOREIGN KEY (id_address) REFERENCES address(address_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
)

CREATE TABLE order_has_voucher (
    order_id INT,
    voucher_id INT,
    PRIMARY KEY (order_id, voucher_id),
    FOREIGN KEY (order_id) REFERENCES order(order_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id)
)

CREATE TABLE user_has_voucher (
    user_id INT,
    voucher_id INT,
    PRIMARY KEY (user_id, voucher_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id)
)

CREATE TABLE order_has_product (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES order(order_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
)

CREATE TABLE user_has_order (
    user_id INT,
    order_id INT,
    PRIMARY KEY (user_id, order_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (order_id) REFERENCES order(order_id)
)
```

### Normalization

* **1NF**: No multivalued columns, atomic values.
* **2NF**: All non-key columns fully dependent on the primary key.
* **3NF**: No transitive dependencies; data split into separate related tables.

---

## B. Sample Order Insertion

Insert a new order for user `"assessment"` purchasing `"KAPPA Women's Sneakers"` (color: yellow, size: 36, quantity: 1).

```sql
-- I assume user_id = 1, address_id = 1, order_id = 1, product_id = 1
-- 1. Add user
INSERT INTO user (user_id, name, email, phone_number)
VALUES (1, 'assessment', 'gu@gmail.com', '328355333');

-- 2. Add user's address
INSERT INTO address (address_id, user_id, street, city, state, country)
VALUES (1, 1, '73 tân hoà 2', 'Phúc Lộc', 'Ba Bể, Bắc Kạn', 'Vietnam');


INSERT INTO user_has_address (id_address, user_id)
VALUES (1, 1);

-- 4. Add product
INSERT INTO product (product_id, name, price, stock_quantity, category_id, store_id)
VALUES (1, 'KAPPA Women''s Sneakers', 980000, 5, NULL, NULL); -- NULL vì chưa rõ category/store

-- 5. Create order
INSERT INTO `order` (order_id, user_id, address_id, status, total_price)
VALUES (1, 1, 1, 'Pending', 980000);


INSERT INTO order_has_product (order_id, product_id, quantity)
VALUES (1, 1, 1);


INSERT INTO user_has_order (user_id, order_id)
VALUES (1, 1);



```

---

## C. Monthly Average Order Value

Query to calculate average total order value per month for the current year.

```sql
SELECT 
    DATE_FORMAT(o.created_at, '%Y-%m') AS month,
    AVG(o.total_price) AS average_order_value
FROM 
    `order` o
WHERE 
    YEAR(o.created_at) = YEAR(CURDATE())
    AND
    o.status = 'Paid'
GROUP BY 
    DATE_FORMAT(o.created_at, '%Y-%m')
ORDER BY 
    month;

```

---

## D. Customer Churn Rate Calculation

```sql
WITH date_ranges AS (
    SELECT
        CURDATE() AS today,
        DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AS six_months_ago,
        DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AS twelve_months_ago
),

active_6_12_months AS (
    SELECT DISTINCT o.user_id
    FROM `order` o
    JOIN date_ranges d ON 1=1
    WHERE o.created_at >= d.twelve_months_ago AND o.created_at < d.six_months_ago
),

active_last_6_months AS (
    SELECT DISTINCT o.user_id
    FROM `order` o
    JOIN date_ranges d ON 1=1
    WHERE o.created_at >= d.six_months_ago AND o.created_at <= d.today
),

churned_users AS (
    SELECT a.user_id
    FROM active_6_12_months a
    LEFT JOIN active_last_6_months b ON a.user_id = b.user_id
    WHERE b.user_id IS NULL
)

SELECT
    COUNT(DISTINCT c.user_id) * 100.0 / COUNT(DISTINCT a.user_id) AS churn_rate_percentage
FROM churned_users c
JOIN active_6_12_months a ON 1=1;

```

---

## E. RESTful API Specifications
Please paste this yaml file to swagger
```yaml
openapi: 3.0.3
info:
  title: E-Commerce Platform API
  version: 1.0.0
  description: RESTful API for an e-commerce platform.

servers:
  - url: https://api.yourdomain.com/v1
    description: Production server

paths:
  /categories:
    get:
      summary: Get all product categories
      tags:
        - Categories
      responses:
        '200':
          description: A list of categories
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Category'

  /categories/{categoryId}/products:
    get:
      summary: Get products by category
      tags:
        - Products
      parameters:
        - name: categoryId
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: List of products in the category
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /products/search:
    get:
      summary: Search products with filters
      tags:
        - Products
      parameters:
        - name: q
          in: query
          required: false
          description: Full-text search term
          schema:
            type: string
        - name: min_price
          in: query
          schema:
            type: number
            format: float
        - name: max_price
          in: query
          schema:
            type: number
            format: float
        - name: category_id
          in: query
          schema:
            type: integer
        - name: store_id
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Search results
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /orders:
    post:
      summary: Create a new order and process payment
      tags:
        - Orders
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderRequest'
      responses:
        '201':
          description: Order created and payment processed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'

  /orders/{orderId}/send-confirmation:
    post:
      summary: Send order confirmation email asynchronously
      tags:
        - Orders
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: integer
      responses:
        '202':
          description: Email sending initiated

components:
  schemas:
    Category:
      type: object
      properties:
        category_id:
          type: integer
        name:
          type: string
        description:
          type: string
        discount_rate:
          type: number
          format: float

    Product:
      type: object
      properties:
        product_id:
          type: integer
        name:
          type: string
        description:
          type: string
        price:
          type: number
          format: float
        stock_quantity:
          type: integer
        category_id:
          type: integer
        store_id:
          type: integer

    OrderRequest:
      type: object
      required:
        - user_id
        - address_id
        - products
      properties:
        user_id:
          type: integer
        address_id:
          type: integer
        voucher_ids:
          type: array
          items:
            type: integer
        products:
          type: array
          items:
            type: object
            properties:
              product_id:
                type: integer
              quantity:
                type: integer

    OrderResponse:
      type: object
      properties:
        order_id:
          type: integer
        status:
          type: string
        total_price:
          type: number
          format: float
        message:
          type: string

```
---

## F. API Implementation

### Tech Stack

* **Node.js**, **Express**
* **MySQL**
* **Nodemailer** for email
* **mysql2** (optional ORM)

### Setup Instructions

```bash
npm install
```

### Running the Server

```bash
npm start
```

---


