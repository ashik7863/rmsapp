const DB = require("../config");
const dbInstance = new DB();
// Function to generate a unique order ID
function generateBookId() {
  const prefix = "ORD";
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${randomDigits}`;
}

// Controller for Creating Order
const CreateOrder = async (req, res) => {
  try {
    await dbInstance.connect(); // Connect to the database

    const { name, mobile, cart_items, amount, rst_id, tbl_id,nop } = req.body;
    const orderId = generateBookId();
    const jsonString = JSON.stringify(cart_items, null, 2);
    const cr_date = new Date().toISOString().slice(0, 10);
    const cr_time = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
    console.log(cr_time,'Test');
    const result = await dbInstance.query(
      `INSERT INTO table_book 
      (name, mobile, cart_items,status, order_id,total_amount,cr_date,cr_time,rst_id,tbl_id,nop) 
      VALUES (?, ?, ?, ?, ?,?,?,?,?,?,?)`,
      [
        name,
        mobile,
        jsonString,
        "Pending",
        orderId,
        amount,
        cr_date,
        cr_time,
        rst_id,
        tbl_id,
        nop
      ]
    );

    let updTable=await dbInstance.query(
      `UPDATE tbl_seat SET status=?,order_id=? WHERE tbl_id=?`,
      ['Reserved',orderId,tbl_id]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Order Created Successfully",
        orderId: orderId, // Return the generated order ID to the frontend
      });
    } else {
      return res.json({
        status: 400,
        msg: "Error While Submitting Order",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close(); // Close the database connection
  }
};

// Controller for Handling Payment Success
const PaymentSuccess = async (req, res) => {
  try {
    await dbInstance.connect(); // Connect to the database

    const { payment_id, order_id, tbl_id } = req.body;

    const result = await dbInstance.query(
      `UPDATE table_book SET tran_id = ?, payment_status=? WHERE order_id = ?`,
      [payment_id, "Success", order_id]
    );

    const result1 = await dbInstance.query(
      `UPDATE tbl_seat SET order_id = ? WHERE tbl_id = ?`,
      [order_id, tbl_id]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Payment Success! Order Confirmed",
      });
    } else {
      return res.json({
        status: 400,
        msg: "Error While Updating Order Status",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close(); // Close the database connection
  }
};

const FetchOrderByMobile = async (req, res) => {
  try {
    await dbInstance.connect();
    let mobile = req.params.mobile;

    const orders = await dbInstance.fetch(
      `SELECT * 
       FROM table_book WHERE mobile=? ORDER BY id DESC`,
      [mobile]
    );

    let updatedOrder = await Promise.all(
      orders.map(async (item) => {
        let cart_items = JSON.parse(item.cart_items);
        let maxWait = 0;
        if(cart_items){
          for (const { item_id } of cart_items) {          
            const fetchWaiting = await dbInstance.arr(
              `SELECT served_time FROM menu_item WHERE item_id=?`,
              [item_id]
            );
            maxWait = Math.max(maxWait, fetchWaiting?.served_time || 0);
          }
        }                
        return { ...item, maxWait };
      })
    );

    if (updatedOrder.length > 0) {
      return res.json({
        status: 200,
        data: updatedOrder,
        msg: "Order fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No order found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};
const FetchOrderByRestaurant = async (req, res) => {
  try {
    await dbInstance.connect();
    let id = req.params.id;

    const orders = await dbInstance.fetch(
      `SELECT * 
       FROM table_book WHERE rst_id=? ORDER BY id DESC`,
      [id]
    );

    if (orders.length > 0) {
      return res.json({
        status: 200,
        data: orders,
        msg: "Order fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No menu found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

module.exports = {
  CreateOrder,
  PaymentSuccess,
  FetchOrderByMobile,
  FetchOrderByRestaurant,
};
