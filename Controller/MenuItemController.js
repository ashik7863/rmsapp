const DB = require('../config');
const { fileFilter, generateRandomName } = require('../Services/Functions');

const dbInstance = new DB();

function generateMenuId() {
  const prefix = 'MNI';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `${prefix}${randomDigits}`;
}

// AddMenuItem function
const AddMenuItem = async (req, res) => {
    try {
      await dbInstance.connect();
  
      const { rst_id,menu_id, name, description,rate,swiggyZomatoPercentage,swiggyZomatoRate,calorie,portion,item_type } = req.body;
      const image = req.file ? req.file.filename : null;
  
      // Check for duplicates
      const duplicateCheck = await dbInstance.num(
        `SELECT id FROM menu_item WHERE menu_id = ? AND name = ?`,
        [menu_id, name]
      );
  
      if (duplicateCheck > 0) {
        return res.json({
          status: 500,
          msg: "Duplicate Item",
        });
      }
  
      let item_id = generateMenuId();
  
      // Insert new menu item
      const result = await dbInstance.query(
        `INSERT INTO menu_item 
        (rst_id, menu_id, item_id, name, image, description, price, swi_perc, swi_rate, calorie, \`portion\`, item_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [rst_id, menu_id, item_id, name, image, description, rate, swiggyZomatoPercentage, swiggyZomatoRate, calorie, portion, item_type]
    );
    
  
      if (result.affectedRows > 0) {
        return res.json({
          status: 200,
          msg: "Item Created Successfully",
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
  

  const FetchAllMenuItem = async (req, res) => {
    try {
      await dbInstance.connect();
      let { id } = req.params;
      let rst_id = id;
 
      // Fetch all menu items for the given restaurant
      const menu = await dbInstance.fetch(
        `SELECT * FROM menu_item WHERE rst_id=? ORDER BY id DESC`,
        [rst_id]
      );


      let menuItemList = await Promise.all(
        menu.map(async (item) => {
          let menu_id = item.menu_id;
          
          const menu_name = await dbInstance.arr(
            `SELECT menu_name FROM menu WHERE menu_id=?`,
            [menu_id]
          );
      
          return { ...item, menu_name: menu_name?.menu_name || '' };
        })
      );

      if (menuItemList.length > 0) {
        return res.json({
          status: 200,
          data: menuItemList,
          msg: "Menu items fetched successfully",
        });
      } else {
        return res.json({
          status: 404,
          msg: "No menu items found",
        });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };
  


const UpdateMenuItem = async (req, res) => {
  try {
    await dbInstance.connect();

    const { id,rst_id,menu_id, name, description,rate,swiggyZomatoPercentage,swiggyZomatoRate,calorie,portion,item_type } = req.body;
      const image = req.file ? req.file.filename : null;

    // Check if the restaurant exists
    const existingRestaurant = await dbInstance.num(
      `SELECT id FROM menu_item WHERE id = ?`,
      [id]
    );

    if (existingRestaurant==0) {
      return res.json({
        status: 404,
        msg: "Menu Item not found",
      });
    }

    // Update restaurant details
    const result = await dbInstance.query(
      `UPDATE menu_item
       SET menu_id=?, name=?, image=?, description=?, price=?, swi_perc=?, swi_rate=?, calorie=?, portion=?, item_type=?
       WHERE id = ?`,
      [menu_id,name,image, description,rate,swiggyZomatoPercentage,swiggyZomatoRate,calorie,portion,item_type,id]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Menu Item Updated Successfully",
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

const DeleteMenuItem = async (req, res) => {
  try {
    await dbInstance.connect();
    let {id}=req.body;

    const menuItem = await dbInstance.num(
      `SELECT id 
       FROM menu_item WHERE id=?`,
       [id]
    );

    if (menuItem > 0) {

      const delete_res = await dbInstance.query(
        `DELETE 
         FROM menu_item WHERE id=?`,
         [id]
      );

      if(delete_res){
        return res.json({
          status: 200,
          msg: "Menu item deleted successfully",
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
        msg: "No menu item found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};


module.exports = { AddMenuItem,FetchAllMenuItem,DeleteMenuItem,UpdateMenuItem };
