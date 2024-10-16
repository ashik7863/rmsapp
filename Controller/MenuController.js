const DB = require('../config');

const dbInstance = new DB();

function generateMenuId() {
  const prefix = 'MN';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `${prefix}${randomDigits}`;
}

const AddMenu = async (req, res) => {
  try {
    await dbInstance.connect();    

    const { rst_id, menu_name, description } = req.body;

    // Check for duplicates
    const duplicateCheck = await dbInstance.num(
      `SELECT id FROM menu WHERE rst_id = ? AND menu_name=?`,
      [rst_id,menu_name]
    );

    if (duplicateCheck > 0) {
      return res.json({
        status: 500,
        msg: "Duplicate Menu",
      });
    }
    let menu_id=generateMenuId();

    // Insert new restaurant
    const result = await dbInstance.query(
      `INSERT INTO menu (rst_id,menu_id, menu_name, description)
       VALUES (?,?, ?,?)`,
      [rst_id, menu_id, menu_name,description]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Menu Created Successfully",
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

const FetchAllMenu = async (req, res) => {
  try {
    await dbInstance.connect();
    let rst_id=req.params.id;
    console.log(rst_id)
    // Fetch all restaurants
    const menu = await dbInstance.fetch(
      `SELECT * 
       FROM menu WHERE rst_id=? ORDER BY id DESC`,
       [rst_id]
    );

    if (menu.length > 0) {
      return res.json({
        status: 200,
        data: menu,
        msg: "Menu fetched successfully",
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


const UpdateMenu = async (req, res) => {
  try {
    await dbInstance.connect();

    const { id, rst_id, menu_name, description } = req.body;

    // Check if the restaurant exists
    const existingRestaurant = await dbInstance.num(
      `SELECT id FROM menu WHERE id = ?`,
      [id]
    );

    if (existingRestaurant==0) {
      return res.json({
        status: 404,
        msg: "Menu not found",
      });
    }

    // Update restaurant details
    const result = await dbInstance.query(
      `UPDATE Menu
       SET menu_name = ?, rst_id = ?, description = ?
       WHERE id = ?`,
      [menu_name,rst_id, description]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Menu Updated Successfully",
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

const DeleteMenu = async (req, res) => {
  try {
    await dbInstance.connect();
    let {id}=req.body;

    const restaurants = await dbInstance.num(
      `SELECT id 
       FROM menu WHERE id=?`,
       [id]
    );

    if (restaurants > 0) {

      const delete_res = await dbInstance.query(
        `DELETE 
         FROM menu WHERE id=?`,
         [id]
      );

      if(delete_res){
        return res.json({
          status: 200,
          msg: "Menu deleted successfully",
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
        msg: "No menu found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};


module.exports = { AddMenu,UpdateMenu,FetchAllMenu,DeleteMenu };
