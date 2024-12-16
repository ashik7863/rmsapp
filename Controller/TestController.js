const DB = require("../config");

const dbInstance = new DB();

const Test = async (req, res) => {
  try {
    await dbInstance.connect();
    

    // const data = await dbInstance.query(
    //   `UPDATE restaurant SET is_logged='No'`
    // );
    const data = await dbInstance.fetch(
      `SELECT * FROM restaurant`
    );
    // const data = await dbInstance.query(
    //   `DELETE FROM table_book WHERE mobile='2565500253'`
    // );
    // const data = await dbInstance.query(
    //   `ALTER TABLE table_book ADD COLUMN cr_time VARCHAR(255)`
    // );
    // "2565500253"
    // const addField=await dbInstance.query(
    // `ALTER TABLE table_book
    // DROP cr_time`);
    // const data = await dbInstance.query(
    //   `SELECT * FROM menu_item`
    // );
    
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
