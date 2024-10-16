const DB = require('../config');
const dbInstance = new DB();

const SuperAdminCount = async (req, res) => {
    try {
      await dbInstance.connect();
      const restaurant = await dbInstance.num(
        `SELECT id 
         FROM restaurant WHERE email!=?`,['superadmin@gmail.com']
      );
      const menu_item = await dbInstance.num(
        `SELECT id 
         FROM menu_item`
      );
      const order = await dbInstance.num(
        `SELECT id 
         FROM table_book`
      );
  
      if (restaurant || menu_item || order) {
        return res.json({
          status: 200,
          data: {restaurant,menu_item,order},
          msg: "Data fetched successfully",
        });
      } else {
        return res.json({
          status: 404,
          msg: "No data found",
        });
      }
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  const AdminCount = async (req, res) => {
    try {
      await dbInstance.connect();

      let rst_id=req.params.id;

      const customer = await dbInstance.fetch(
        `SELECT mobile FROM table_book WHERE rst_id=?`,[rst_id]
      );
      const uniqueCustomer = Array.from(
        new Set(customer.map(item => item.mobile))
      );

      const menu_item = await dbInstance.num(
        `SELECT id 
         FROM menu_item WHERE rst_id=?`,[rst_id]
      );
      const order = await dbInstance.num(
        `SELECT id 
         FROM table_book WHERE rst_id=?`,[rst_id]
      );
  
      if (customer || menu_item || order) {
        return res.json({
          status: 200,
          data: {customer:uniqueCustomer.length,menu_item:menu_item,order:order},
          msg: "Data fetched successfully",
        });
      } else {
        return res.json({
          status: 404,
          msg: "No data found",
        });
      }
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  module.exports = { SuperAdminCount,AdminCount };