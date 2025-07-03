import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home          from "./pages/Home";
import Products      from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Checkout      from "./pages/Checkout";
import Success       from "./pages/Success";

import AddProduct    from "./pages/seller/AddProduct";
import ProductList   from "./pages/seller/ProductList";
import Orders        from "./pages/seller/Orders";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* customer pages */}
        <Route path="/"          element={<Home />} />
        <Route path="/products"  element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* checkout flow */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success"  element={<Success />} />

        {/* seller pages */}
        <Route path="/seller"            element={<AddProduct />} />         {/* default /seller */}
        <Route path="/seller/product-list" element={<ProductList />} />
        <Route path="/seller/orders"       element={<Orders />} />

        {/* catch-all 404 */}
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
