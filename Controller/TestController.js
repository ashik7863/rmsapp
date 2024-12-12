const DB = require("../config");

const dbInstance = new DB();

const Test = async (req, res) => {
  try {
    await dbInstance.connect();
    

    // const data = await dbInstance.fetch(
    //   `UPDATE tbl_seat SET status='Available'`
    // );
    // const addField=await dbInstance.query(
    // `ALTER TABLE menu_item
    // ADD served_time VARCHAR(50);
    // `);
    const data = await dbInstance.query(
      `SELECT * FROM menu_item`
    );
    
    return res.json({
        status: 200,
        data:data,
        msg: "Successfull",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};



module.exports = { Test };
