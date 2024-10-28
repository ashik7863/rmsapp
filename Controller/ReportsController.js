const DB = require("../config");
const dbInstance = new DB();

const FetchAllRestaurantsReports = async (req, res) => {
  try {
    await dbInstance.connect();

    // Fetch all restaurants
    const restaurants = await dbInstance.fetch(
      `SELECT rst_id,email,owner,mobile,restaurant_name,cr_date 
       FROM restaurant WHERE email!=?`,
      ["superadmin@gmail.com"]
    );

    let updRestList = await Promise.all(
      restaurants.map(async (item) => {
        let rstId = item.rst_id;

        const newList = await dbInstance.arr(
          `SELECT SUM(total_amount) as total 
           FROM table_book WHERE rst_id=?`,
          [rstId]
        );
        const tableBook = await dbInstance.num(
          `SELECT id 
           FROM table_book WHERE rst_id=?`,
          [rstId]
        );
        const tableCustomer = await dbInstance.num(
          `SELECT DISTINCT mobile 
           FROM table_book WHERE rst_id=?`,
          [rstId]
        );

        return {
          ...item,
          total_amount: newList["total"] || 0,
          total_booking: tableBook || 0,
          customer: tableCustomer || 0,
        };
      })
    );

    if (restaurants.length > 0) {
      return res.json({
        status: 200,
        data: updRestList,
        msg: "Restaurants fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No restaurants found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

module.exports = { FetchAllRestaurantsReports };
