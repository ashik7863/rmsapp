const DB = require('../config');

const dbInstance = new DB();

function generateTableId() {
  const prefix = 'TBL';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `${prefix}${randomDigits}`;
}

const AddTable = async (req, res) => {
    try {
      await dbInstance.connect();
  
      const { rst_id, tbl_no, seat, status,staff } = req.body;
  
      // Check for duplicates (optional)
      const duplicateCheck = await dbInstance.num(
        `SELECT id FROM tbl_seat WHERE tbl_No = ?`,
        [tbl_no]
      );
  
      if (duplicateCheck > 0) {
        return res.json({
          status: 500,
          msg: "Table already exists.",
        });
      }
  
      // Insert new table
      let tbl_id=generateTableId();
      const result = await dbInstance.query(
        `INSERT INTO tbl_seat (rst_id, tbl_id, tbl_no, seat, status,staff_id)
         VALUES (?, ?, ?, ?, ?,?)`,
        [rst_id, tbl_id, tbl_no, seat, status,staff]
      );
  
      if (result.affectedRows > 0) {
        return res.json({
          status: 200,
          msg: "Table added successfully.",
        });
      } else {
        return res.json({
          status: 400,
          msg: "Error while adding table.",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  const FetchAllTable = async (req, res) => {
    try {
      await dbInstance.connect();
      let { id } = req.params;
      let rst_id = atob(id);
  
      // Fetch all menu items for the given restaurant
      const tableList = await dbInstance.fetch(
        `SELECT * FROM tbl_seat WHERE rst_id=? ORDER BY id DESC`,
        [rst_id]
      );

      for (let i = 0; i < tableList.length; i++) {
        const staff_id = tableList[i].staff_id;
      
        // Fetch staff_name from the staff table based on staff_id
        const staffDetails = await dbInstance.arr(
          `SELECT name FROM staff WHERE emp_id=?`,
          [staff_id]
        );
      
        // Set the staff_name in the current tableList item
        tableList[i].staff_name = staffDetails ? staffDetails.name : null;
      }
  
      if (tableList.length > 0) {
        return res.json({
          status: 200,
          data: tableList,
          msg: "Table fetched successfully",
        });
      } else {
        return res.json({
          status: 404,
          msg: "No table found",
        });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  const FetchTableByStaff = async (req, res) => {
    try {
      await dbInstance.connect();
      let { id } = req.params;
      let staff_id = id;

      // Fetch all menu items for the given restaurant
      const tableList = await dbInstance.fetch(
        `SELECT * FROM tbl_seat WHERE staff_id=? ORDER BY id DESC`,
        [staff_id]
      );

     

      let updatedTable = await Promise.all(
        tableList.map(async (item) => {
          const tblId = item.tbl_id;
          
          const cartItems = await dbInstance.arr(
            `SELECT cart_items FROM table_book WHERE tbl_id=? AND status=?`,
            [tblId,'Pending']
          );
      
          return { ...item, cartItems: cartItems?.cart_items || '' };
        })
      );
  
      if (tableList.length > 0) {
        return res.json({
          status: 200,
          data: updatedTable,
          msg: "Table fetched successfully",
        });
      } else {
        return res.json({
          status: 404,
          msg: "No table found",
        });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };

  const DeleteTable = async (req, res) => {
    try {
      await dbInstance.connect();
      let {id}=req.body;
  
      const staff = await dbInstance.num(
        `SELECT id 
         FROM tbl_seat WHERE id=?`,
         [id]
      );
  
      if (staff > 0) {
  
        const delete_staff = await dbInstance.query(
          `DELETE 
           FROM tbl_seat WHERE id=?`,
           [id]
        );
  
        if(delete_staff){
          return res.json({
            status: 200,
            msg: "Table deleted successfully",
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
          msg: "No table found",
        });
      }
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await dbInstance.close();
    }
  };
  
  module.exports = {
    AddTable,FetchAllTable,DeleteTable,FetchTableByStaff
  };