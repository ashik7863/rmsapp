const DB = require('../config');
const {HashPassword} = require('../Services/Functions');

const dbInstance = new DB();

function generateRestaurantId() {
  const prefix = 'RS';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `${prefix}${randomDigits}`;
}

const AddRestaurant = async (req, res) => {
  try {
    await dbInstance.connect();    

    const { restaurant_name, email, mobile, owner, address } = req.body;

    let password=HashPassword(req.body.password);

    // Check for duplicates
    const duplicateCheck = await dbInstance.num(
      `SELECT id FROM restaurant WHERE restaurant_name = ? OR email=? OR mobile=?`,
      [restaurant_name,email,mobile]
    );

    if (duplicateCheck > 0) {
      return res.json({
        status: 500,
        msg: "Duplicate Restaurant",
      });
    }
    const restaurantId = generateRestaurantId();
    // Insert new restaurant
    const result = await dbInstance.query(
      `INSERT INTO restaurant (rst_id,owner, email, mobile, password, restaurant_name, address,status)
       VALUES (?,?, ?, ?, ?, ?, ?,?)`,
      [restaurantId,owner, email, mobile, password, restaurant_name, address,'Active']
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Restaurant Created Successfully",
      });
    } else {
      return res.json({
        status: 400,
        msg: "Error While Submitting",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

const FetchAllRestaurants = async (req, res) => {
  try {
    await dbInstance.connect();

    // Fetch all restaurants
    const restaurants = await dbInstance.fetch(
      `SELECT * 
       FROM restaurant WHERE email!=?`,
       ['superadmin@gmail.com']
    );

    if (restaurants.length > 0) {
      return res.json({
        status: 200,
        data: restaurants,
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


const UpdateRestaurant = async (req, res) => {
  try {
    await dbInstance.connect();

    const { id, restaurant_name, email, mobile, password, owner, address } = req.body;

    // Check if the restaurant exists
    const existingRestaurant = await dbInstance.num(
      `SELECT id FROM restaurant WHERE rst_id = ?`,
      [id]
    );

    if (existingRestaurant==0) {
      return res.json({
        status: 404,
        msg: "Restaurant not found",
      });
    }

    // Update restaurant details
    const result = await dbInstance.query(
      `UPDATE restaurant
       SET restaurant_name = ?, email = ?, mobile = ?, password = ?, owner = ?, address = ?
       WHERE id = ?`,
      [restaurant_name, email, mobile, password, owner, address, id]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Restaurant Updated Successfully",
      });
    } else {
      return res.json({
        status: 400,
        msg: "Error While Updating",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

const DeleteRestaurants = async (req, res) => {
  try {
    await dbInstance.connect();
    let {id}=req.body;

    const restaurants = await dbInstance.num(
      `SELECT id 
       FROM restaurant WHERE id=?`,
       [id]
    );

    if (restaurants > 0) {

      const delete_res = await dbInstance.query(
        `DELETE 
         FROM restaurant WHERE id=?`,
         [id]
      );

      if(delete_res){
        return res.json({
          status: 200,
          msg: "Restaurants deleted successfully",
        });
      }else{
        return res.json({
          status: 500,
          msg: "Error while deleting",
        });
      }

      
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


module.exports = { AddRestaurant,UpdateRestaurant,FetchAllRestaurants,DeleteRestaurants };
