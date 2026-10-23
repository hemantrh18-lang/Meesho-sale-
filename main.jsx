import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const money = n => `₹${Number(n).toLocaleString("en-IN")}`;

function App() {
  const [products,setProducts] = useState([]);
  const [query,setQuery] = useState("");
  const [category,setCategory] = useState("All");
  const [cart,setCart] = useState({});
  const [showCart,setShowCart] = useState(false);
  const [checkout,setCheckout] = useState(false);
  const [form,setForm] = useState({customer:"",phone:"",address:""});
  const [notice,setNotice] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/products`).then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(setProducts).catch(() => setNotice("API connect nahi hua. Backend server start karein."))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];
  const shown = products.filter(p => (category==="All" || p.category===category) && `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  const cartItems = useMemo(() => products.filter(p => cart[p.id]).map(p => ({...p, quantity:cart[p.id]})), [products,cart]);
  const total = cartItems.reduce((s,p) => s + p.price*p.quantity,0);
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  const add = id => setCart(c => ({...c,[id]:(c[id]||0)+1}));
  const change = (id,delta) => setCart(c => { const n=(c[id]||0)+delta; const next={...c}; if(n<=0) delete next[id]; else next[id]=n; return next; });

  async function placeOrder(e) {
    e.preventDefault(); setNotice("");
    try {
      const response = await fetch(`${API}/api/orders`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,items:cartItems.map(p=>({productId:p.id,quantity:p.quantity}))})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order place nahi hua.");
      setNotice(`Order placed! Demo order ID: ${data.order.id.slice(0,8)}. Payment abhi COD/demo mode mein hai.`);
      setCart({}); setCheckout(false); setShowCart(false); setForm({customer:"",phone:"",address:""});
    } catch(err) { setNotice(err.message || "Backend se connect nahi ho pa raha."); }
  }

  return <div className="app">
    <div className="topline">✨ Everyday deals • Simple shopping • Demo store</div>
    <header className="header">
      <a className="brand" href="#"><span className="brandmark">M</span><span>meesho <b>sale</b><small>SHOP SMART. LIVE BETTER.</small></span></a>
      <div className="search"><span>⌕</span><input aria-label="Search products" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for products, brands and more"/></div>
      <button className="cartButton" onClick={()=>setShowCart(true)}>🛍 Cart <b>{count}</b></button>
    </header>
    <nav className="nav">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
    <main>
      <section className="hero">
        <div><p className="eyebrow">YOUR DAILY SHOPPING DESTINATION</p><h1>Big style.<br/><em>Small prices.</em></h1><p>Find your everyday favourites at prices you'll love.</p><button className="primary" onClick={()=>document.getElementById("products").scrollIntoView({behavior:"smooth"})}>Explore collection <span>→</span></button></div>
        <div className="heroArt"><div className="circle"></div><div className="heroLabel">NEW<br/>FINDS<br/><b>2026</b></div><div className="floatingTag">Deals from <b>₹199</b></div></div>
      </section>
      <div className="sectionHeading" id="products"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Popular picks</h2></div><span>{shown.length} products</span></div>
      {notice && <div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      {loading ? <p className="empty">Loading products…</p> : shown.length===0 ? <p className="empty">No products found. Try another search.</p> :
        <section className="grid">{shown.map((p,i)=><article className="product" key={p.id}>
          <div className="photo"><img src={p.image} alt={p.name} loading="lazy"/><span className="discount">{Math.round((1-p.price/p.mrp)*100)}% OFF</span><button className="heart" aria-label="Save item" onClick={e=>e.currentTarget.classList.toggle("liked")}>♡</button></div>
          <div className="productInfo"><span className="category">{p.category}</span><h3>{p.name}</h3><div className="rating">★ {p.rating} <span>•</span> <span className="muted">Popular pick</span></div><div className="prices"><b>{money(p.price)}</b><del>{money(p.mrp)}</del></div><button className="add" onClick={()=>{add(p.id);setNotice(`${p.name} added to cart.`)}}>＋ Add to cart</button></div>
        </article>)}</section>}
      <section className="trust"><div>🚚<b>Delivery updates</b><span>Track order status</span></div><div>🔒<b>Safer checkout</b><span>Secure setup ready</span></div><div>💬<b>Here to help</b><span>Support for your order</span></div></section>
    </main>
    <footer><a className="brand footerBrand" href="#"><span className="brandmark">M</span><span>meesho <b>sale</b></span></a><p>An independent demo shopping store. Not affiliated with Meesho.</p><span>© 2026 Meesho Sale Starter</span></footer>

    {showCart && <div className="overlay" onClick={()=>setShowCart(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawerHead"><h2>Your cart ({count})</h2><button onClick={()=>setShowCart(false)}>×</button></div>
      {cartItems.length===0 ? <p className="empty">Your cart is waiting for something lovely.</p> : <>
        <div className="cartList">{cartItems.map(p=><div className="cartRow" key={p.id}><img src={p.image} alt=""/><div className="cartDesc"><b>{p.name}</b><span>{money(p.price)}</span><div className="qty"><button onClick={()=>change(p.id,-1)}>−</button><span>{p.quantity}</span><button onClick={()=>change(p.id,1)}>＋</button></div></div><b>{money(p.price*p.quantity)}</b></div>)}</div>
        <div className="total"><span>Total</span><b>{money(total)}</b></div>
        {!checkout ? <button className="primary full" onClick={()=>setCheckout(true)}>Continue to checkout →</button> : <form className="checkout" onSubmit={placeOrder}><h3>Delivery details</h3><input required placeholder="Full name" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}/><input required type="tel" pattern="[0-9+ ()-]{8,20}" placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><textarea required placeholder="Full delivery address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><p className="muted">Demo checkout — no online payment is collected.</p><button className="primary full">Place demo order</button></form>}
      </>}
    </aside></div>}
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);
