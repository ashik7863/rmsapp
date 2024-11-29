const DB = require("../config");

const dbInstance = new DB();

const Test = async (req, res) => {
  try {
    await dbInstance.connect();
    

    const data = await dbInstance.fetch(
      `SELECT * FROM table_book`
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
