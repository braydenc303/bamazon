DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

ALTER TABLE products
ADD COLUMN product_sales INT;

SELECT * FROM products;

CREATE TABLE products (
	item_id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(30),
    department_name VARCHAR(30),
    price DECIMAL(10,2),
    stock_qty INT
);

USE bamazon_DB;

CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30),
    over_head_costs INT
);

INSERT INTO departments (department_name, over_head_costs)
	VALUES("Cutlery", 5000),
    ("Kitchen Tools", 8000),
    ("Apparel", 3000);
    
SELECT * FROM departments;

INSERT INTO products (product_name, department_name, price, stock_qty)
VALUES ("Chef's Knife","Cutlery",150.00,10),
("Paring Knife","Cutlery",15.00,10),
("Bread Knife","Cutlery",75.00,8),
("Measuring Spoons","Kitchen Tools",20.00,15),
("Measuring Cup 4c","Kitchen Tools",15.00,10),
("Measuring Cup 8c","Kitchen Tools",30.00,8),
("Cast Iron Skillet 14in","Kitchen Tools",99.00,10),
("Cast Iron Skillet 6in","Kitchen Tools",49.00,15),
("Mixing Bowls Set of 9","Kitchen Tools",79.00,5),
("Apron-White","Apparel",35.00,8);

SELECT * FROM products;
