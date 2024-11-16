const DB = require('../config');
const {HashPassword} = require('../Services/Functions');
const {deleteFile} = require('../DeleteFile');
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
    const logo = req.files.logo ? req.files.logo[0].path : null;
  const documents = req.files.documents
    ? req.files.documents.map((file) => file.path)
    : [];

    // Insert new restaurant
    let today = new Date();
    let today1=today.toISOString().split('T')[0];
    const result = await dbInstance.query(
      `INSERT INTO restaurant (rst_id,owner, email, mobile, password, restaurant_name, address,status,logo,cr_date,docs)
       VALUES (?,?, ?, ?, ?, ?, ?,?,?,?,?)`,
      [restaurantId,owner, email, mobile, password, restaurant_name, address,'Active',logo,today1,documents]
    );

    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    let nextMonth1=nextMonth.toISOString().split('T')[0];
    const result1 = await dbInstance.query(
      `INSERT INTO plan_details (rst_id,plan_id, start_date,end_date,status,amount,plan_name)
       VALUES (?,?, ?, ?, ?,?,?)`,
      [restaurantId,1,today1, nextMonth1,'Running',0,'Free Trial']
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

    let updRestList = await Promise.all(
      restaurants.map(async (item) => {
        let rstId = item.rst_id;
        
        const newList = await dbInstance.fetch(
          `SELECT * 
           FROM plan_details WHERE rst_id=?`,
           [rstId]
        );
    
        return { ...item, plan_details: newList || '' };
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


const UpdateRestaurant = async (req, res) => {
  try {
    await dbInstance.connect();

    const { id, restaurant_name, email, mobile, password, owner, address,status } = req.body;

    // Check if the restaurant exists
    const existingRestaurant = await dbInstance.num(
      `SELECT id FROM restaurant WHERE id = ?`,
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
       SET restaurant_name = ?, email = ?, mobile = ?, password = ?, owner = ?, address = ?,status=?
       WHERE id = ?`,
      [restaurant_name, email, mobile, password, owner, address,status, id]
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
       FROM restaurant WHERE rst_id=?`,
       [id]
    );

    if (restaurants > 0) {

      const getRestaurant = await dbInstance.arr(
        `SELECT logo,docs 
         FROM restaurant WHERE rst_id=?`,
         [id]
      );

      deleteFile(getRestaurant?.logo);
      let docs=JSON.parse(getRestaurant.docs);
      docs?.map((doc)=>{
        deleteFile(doc);
      })
    
      const delete_res = await dbInstance.query(
        `DELETE 
         FROM restaurant WHERE rst_id=?`,
         [id]
      );
      const delete_plan = await dbInstance.query(
        `DELETE 
         FROM plan_details WHERE rst_id=?`,
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

const FetchCustomer = async (req, res) => {
  try {
    await dbInstance.connect();
    let id=req.params.id;

    const customer = await dbInstance.fetch(
      `SELECT name,mobile,cr_date 
       FROM table_book WHERE rst_id=? ORDER BY id DESC`,
       [id]
    );
    const uniqueData = Array.from(
      new Map(customer.map(item => [item.mobile, item])).values()
    );
    if (customer.length > 0) {
      return res.json({
        status: 200,
        data: uniqueData,
        msg: "Customer fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No customer found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};
const FetchRestaurantById = async (req, res) => {
  try {
    await dbInstance.connect();
    let id=req.params.id;

    const restaurant = await dbInstance.fetch(
      `SELECT * 
       FROM restaurant WHERE rst_id=?`,
       [id]
    );
  
    if (restaurant.length > 0) {
      return res.json({
        status: 200,
        data: restaurant,
        msg: "Restaurant fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No restaurant found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};
const calculateRemainingDays = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24)); 
  return diff >= 0 ? diff : 0; 
};
const FetchPlanDetailsById = async (req, res) => {
  try {
    await dbInstance.connect();
    let id=req.params.id;

    const restaurant = await dbInstance.fetch(
      `SELECT * 
       FROM plan_details WHERE rst_id=?`,
       [id]
    );       

    restaurant.forEach((val) => {
      val.remaining=calculateRemainingDays(val.end_date);
    });
  
    if (restaurant.length > 0) {
      return res.json({
        status: 200,
        data: restaurant,
        msg: "Plan details fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No plan details found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

const AddPurcahsePlan = async (req, res) => {
  try {
    await dbInstance.connect();    
    const { rst_id,plan_id } = req.body;

    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    let nextMonth1=nextMonth.toISOString().split('T')[0];
    const result1 = await dbInstance.query(
      `INSERT INTO plan_details (rst_id,plan_id, start_date,end_date,status,amount,plan_name)
       VALUES (?,?, ?, ?, ?,?,?)`,
      [restaurantId,1,today1, nextMonth1,'Running',0,'Free Trial']
    );


    if (result1.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Plan Purchased Successfully",
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
module.exports = { AddRestaurant,UpdateRestaurant,FetchAllRestaurants,DeleteRestaurants,FetchCustomer,FetchRestaurantById,FetchPlanDetailsById };
