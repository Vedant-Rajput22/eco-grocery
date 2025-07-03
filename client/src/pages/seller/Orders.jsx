import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Orders = () => {
  const { axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);

  /* ───── fetch once on mount ───── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/order/seller", {
          withCredentials: true,
        });
        if (data.success) setOrders(data.orders);
        else toast.error(data.message);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [axios]);

  /* ───── card markup ───── */
  return (
    <div className="p-4 md:p-10 space-y-4">
      <h2 className="text-lg font-semibold">Orders List</h2>

      {orders.map((order) => {
        const firstItem = order.items?.[0];
        const imgSrc =
          firstItem?.product?.images?.[0] ??
          "https://via.placeholder.com/80?text=No+Image";

        return (
          <div
            key={order._id}
            className="flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1fr_1fr] gap-5 p-5 max-w-4xl rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
          >
            {/* ── items & image ── */}
            <div className="flex gap-5">
              <img
                className="w-12 h-12 object-cover opacity-75 rounded"
                src={`http://localhost:5000/images/${imgSrc}`}
                alt={firstItem?.product?.name || "Product"}
              />

              <div>
                {order.items.map((it) => (
                  <p key={it._id} className="font-medium">
                    {it.product?.name ?? "Item"}{" "}
                    {it.quantity > 1 && (
                      <span className="text-indigo-500">× {it.quantity}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* ── shipping address ── */}
            <div className="text-sm leading-5">
              <p className="font-medium">
                {order.address?.firstName} {order.address?.lastName}
              </p>
              <p>
                {order.address?.street}, {order.address?.city},{" "}
                {order.address?.state} {order.address?.zipcode},{" "}
                {order.address?.country}
              </p>
            </div>

            {/* ── amount ── */}
            <p className="font-semibold text-base my-auto text-black/70 dark:text-white/80">
              ₹{order.amount.toFixed(2)}
            </p>

            {/* ── metadata ── */}
            <div className="flex flex-col text-sm">
              <p>Method&nbsp;:&nbsp;{order.paymentType}</p>
              <p>
                Date&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p
                className={
                  order.isPaid ? "text-green-600" : "text-red-600"
                }
              >
                Payment&nbsp;:&nbsp;
                {order.isPaid ? "Paid" : "Pending"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Orders;
