const DB = require("../config");

const dbInstance = new DB();

const Test = async (req, res) => {
  try {
    await dbInstance.connect();
    
    const data = await dbInstance.arr(
      `SELECT * FROM restaurant WHERE id=27`
    );
    
    return res.json({
        status: 200,
        data:data['is_logged']==null,
        msg: "Successfull",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};



module.exports = { Test };
