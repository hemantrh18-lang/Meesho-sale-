import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({ origin: process.env.WEB_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));

const products = [
  { id:"p1", name:"Printed Everyday Kurti", category:"Women", price:499, mrp:999, rating:4.3, image:"https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=800&q=80", description:"Comfortable printed kurti for everyday wear." },
  { id:"p2", name:"Casual Cotton Shirt", category:"Men", price:399, mrp:799, rating:4.1, image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", description:"Easy-to-style casual shirt." },
  { id:"p3", name:"Minimal Daily Backpack", category:"Accessories", price:599, mrp:1199, rating:4.4, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", description:"A practical backpack for daily use." },
  { id:"p4", name:"Classic Sneakers", category:"Footwear", price:799, mrp:1499, rating:4.2, image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80", description:"Everyday sneakers with a clean look." },
  { id:"p5", name:"Home Cushion Set", category:"Home", price:349, mrp:699, rating:4.0, image:"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80", description:"Soft decorative cushions for your home." },
  { id:"p6", name:"Women's Everyday Tote", category:"Accessories", price:449, mrp:899, rating:4.5, image:"https://images.unsplash.com/photo-1590877740965-2e4e2f5f8a4f?auto=format&fit=crop&w=800&q=80", description:"Roomy tote bag for everyday essentials." }
];
const orders = [];

app.get("/api/health", (_req, res) => res.json({ ok:true, service:"Meesho Sale API" }));
app.get("/api/products", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const category = String(req.query.category || "");
  res.json(products.filter(p => (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) && (!category || category === "All" || p.category === category)));
});
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error:"Product not found" });
  res.json(product);
});
app.post("/api/orders", (req, res) => {
  const { customer, items, address, phone } = req.body || {};
  if (!customer || !address || !phone || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error:"Name, phone, address and cart items are required." });
  const normalized = [];
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    const qty = Number(item.quantity);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20)
      return res.status(400).json({ error:"Invalid product or quantity." });
    normalized.push({ productId:product.id, name:product.name, price:product.price, quantity:qty });
  }
  const order = { id:randomUUID(), customer:String(customer).slice(0,100), phone:String(phone).slice(0,20), address:String(address).slice(0,500), items:normalized, total:normalized.reduce((s,i)=>s+i.price*i.quantity,0), status:"Pending", createdAt:new Date().toISOString() };
  orders.push(order);
  res.status(201).json({ message:"Order placed in demo mode.", order });
});
// DEMO ONLY: add authentication/authorization before exposing this endpoint.
app.get("/api/orders", (_req, res) => res.json(orders));
app.listen(PORT, () => console.log(`Meesho Sale API running at http://localhost:${PORT}`));
