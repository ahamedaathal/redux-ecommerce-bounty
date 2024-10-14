import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('SECRET_KEY is not set');
}

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./shop.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      quantity INTEGER,
      seller_id INTEGER,
      FOREIGN KEY (seller_id) REFERENCES users (id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_amount REAL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    )`);
  }
});

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const token = jwt.sign({ id: this.lastID, username, role }, SECRET_KEY);
      res.status(201).json({ 
        token,
        user: {
          id: this.lastID,
          username,
          role
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging in' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    try {
      if (await bcrypt.compare(password, (user as any).password)) {
        const token = jwt.sign({ id: (user as any).id, username: (user as any).username, role: (user as any).role }, SECRET_KEY);
        res.json({ 
          token,
          user: {
            id: (user as any).id,
            username: (user as any).username,
            role: (user as any).role
          }
        });
      } else {
        res.status(400).json({ error: 'Invalid username or password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  });
});

app.get('/api/products', (req, res) => {
  console.log('Received request for /api/products');
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Error fetching products' });
    }
    console.log('Sending products:', rows);
    res.json(rows);
  });
});

app.post('/api/products', authenticateToken, (req: express.Request, res: express.Response) => {
  const { name, price, quantity } = req.body;
  const user = (req as any).user;

  if (user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can add products' });
  }

  if (!name || !price || !quantity) {
    return res.status(400).json({ error: 'Name, price, and quantity are required' });
  }

  db.run('INSERT INTO products (name, price, quantity, seller_id) VALUES (?, ?, ?, ?)', 
    [name, price, quantity, user.id], 
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error adding product' });
      }
      res.status(201).json({ id: this.lastID, name, price, quantity, seller_id: user.id });
    }
  );
});

app.get('/api/orders', authenticateToken, (req: express.Request, res: express.Response) => {
  const user = (req as any).user;

  if (user.role !== 'shopper') {
    return res.status(403).json({ error: 'Only shoppers can view their order history' });
  }

  db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC', [user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching order history' });
    }
    res.json(rows);
  });
});

app.post('/api/products/buy', authenticateToken, (req: express.Request, res: express.Response) => {
  const { items } = req.body;
  const user = (req as any).user;

  if (user.role !== 'shopper') {
    return res.status(403).json({ error: 'Only shoppers can buy products' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order items' });
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let success = true;
    let totalAmount = 0;
    const updates: Promise<void>[] = [];

    db.run('INSERT INTO orders (user_id) VALUES (?)', [user.id], function(err) {
      if (err) {
        success = false;
        return res.status(500).json({ error: 'Error creating order' });
      }

      const orderId = this.lastID;

      items.forEach(item => {
        updates.push(new Promise<void>((resolve, reject) => {
          db.get('SELECT * FROM products WHERE id = ?', [item.id], (err, product) => {
            if (err) {
              success = false;
              reject(err);
            } else if (!product) {
              success = false;
              reject(new Error(`Product with id ${item.id} not found`));
            } else if ((product as any).quantity < item.quantity) {
              success = false;
              reject(new Error(`Insufficient quantity for product ${item.id}`));
            } else {
              db.run('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.id], (err) => {
                if (err) {
                  success = false;
                  reject(err);
                } else {
                  db.run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity, (product as any).price], (err) => {
                      if (err) {
                        success = false;
                        reject(err);
                      } else {
                        totalAmount += (product as any).price * item.quantity;
                        resolve();
                      }
                    });
                }
              });
            }
          });
        }));
      });

      Promise.all(updates)
        .then(() => {
          if (success) {
            db.run('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Error updating order total' });
              } else {
                db.run('COMMIT', (err) => {
                  if (err) {
                    res.status(500).json({ error: 'Error completing the order' });
                  } else {
                    res.json({ message: 'Order placed successfully', orderId });
                  }
                });
              }
            });
          } else {
            db.run('ROLLBACK');
            res.status(400).json({ error: 'Error processing the order' });
          }
        })
        .catch((error) => {
          db.run('ROLLBACK');
          res.status(400).json({ error: error.message });
        });
    });
  });
});

app.get('/api/users', authenticateToken, (req: express.Request, res: express.Response) => {
  const user = (req as any).user;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view all users' });
  }

  db.all('SELECT id, username, role FROM users', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users' });
    }
    res.json(rows);
  });
});

app.post('/api/users', authenticateToken, async (req: express.Request, res: express.Response) => {
  const { username, password, role } = req.body;
  const user = (req as any).user;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add users' });
  }

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      res.status(201).json({ id: this.lastID, username, role });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding user' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req: express.Request, res: express.Response) => {
  const userId = req.params.id;
  const user = (req as any).user;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete users' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

app.get('/api/seller/products', authenticateToken, (req: express.Request, res: express.Response) => {
  const user = (req as any).user;

  if (user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can view their products' });
  }

  db.all('SELECT * FROM products WHERE seller_id = ?', [user.id], (err, rows) => {
    if (err) {
      console.error('Error fetching seller products:', err);
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(rows);
  });
});

app.put('/api/products/:id', authenticateToken, (req: express.Request, res: express.Response) => {
  const { name, price, quantity } = req.body;
  const productId = req.params.id;
  const user = (req as any).user;

  if (user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can update products' });
  }

  db.run(
    'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ? AND seller_id = ?',
    [name, price, quantity, productId, user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found or you do not have permission to update it' });
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, (req: express.Request, res: express.Response) => {
  const productId = req.params.id;
  const user = (req as any).user;

  if (user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can delete products' });
  }

  db.run('DELETE FROM products WHERE id = ? AND seller_id = ?', [productId, user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found or you do not have permission to delete it' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

app.get('/api/seller/orders', authenticateToken, (req: express.Request, res: express.Response) => {
  const user = (req as any).user;

  if (user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can view their orders' });
  }

  const query = `
    SELECT o.id, o.order_date, o.total_amount, oi.product_id, oi.quantity, oi.price, p.name AS product_name
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.seller_id = ?
    ORDER BY o.order_date DESC
  `;

  db.all(query, [user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching orders' });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});