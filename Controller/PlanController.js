const DB = require("../config");

const dbInstance = new DB();
function generatePlanId() {
  const prefix = 'PLN';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `${prefix}${randomDigits}`;
}
const FetchAllPlan = async (req, res) => {
  try {
    await dbInstance.connect();

    const plan = await dbInstance.fetch(
      `SELECT * 
       FROM plan WHERE id!=? ORDER BY id DESC`,
      [1]
    );

    if (plan.length > 0) {
      return res.json({
        status: 200,
        data: plan,
        msg: "Plan fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No plan found",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

const AddPlan = async (req, res) => {
  try {
    await dbInstance.connect();
    const { plan, amount,month_count } = req.body;

    const duplicateCheck = await dbInstance.num(
      `SELECT id FROM plan WHERE month_count = ?`,
      [month_count]
    );

    if (duplicateCheck > 0) {
      return res.json({
        status: 500,
        msg: "Duplicate Plan",
      });
    }
let planId=generatePlanId();
    const result = await dbInstance.query(
      `INSERT INTO plan (plan,amount,month_count,plan_id)
         VALUES (?,?,?,?)`,
      [plan, amount,month_count,planId]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Plan Created Successfully",
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

const PurchaseNewPlan = async (req, res) => {
  try {
    await dbInstance.connect();
    const { plan_id, payment_id, totalAmount, rst_id, plan, month_count } =
      req.body;
    let today = new Date();
    let today1 = today.toISOString().split("T")[0];

    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + month_count);
    let nextMonth1=nextMonth.toISOString().split('T')[0];

    const result = await dbInstance.query(
      `INSERT INTO plan_details (rst_id,plan_id, start_date,end_date,status,amount,plan_name)
         VALUES (?,?,?, ?, ?,?,?)`,
      [rst_id, plan_id, today1,nextMonth1,"Running", totalAmount, plan]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Plan Added Successfully",
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

const UpdatePlan = async (req, res) => {
  try {
    await dbInstance.connect();
    const { plan, amount,month_count,id } = req.body;

    const isExist = await dbInstance.num(
      `SELECT id FROM plan WHERE id = ?`,
      [id]
    );

    if (isExist == 0) {
      return res.json({
        status: 500,
        msg: "Plan is not found",
      });
    }

    const result = await dbInstance.query(
      `UPDATE plan SET plan=?,amount=?,month_count=? WHERE id=?`,
      [plan, amount,month_count,id]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Plan Updated Successfully",
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

const DeletePlan = async (req, res) => {
  try {
    await dbInstance.connect();
    let {id}=req.body;

    const menuItem = await dbInstance.num(
      `SELECT id 
       FROM plan WHERE id=?`,
       [id]
    );

    if (menuItem > 0) {     

      const checkPlan = await dbInstance.num(
        `SELECT id 
         FROM plan_details WHERE plan_id=? AND status=?`,
         [id,'Running']
      );

      if(checkPlan>0){
        return res.json({
          status: 404,
          msg: "Plan is already used",
        });
      }

      const delete_res = await dbInstance.query(
        `DELETE 
         FROM plan WHERE id=?`,
         [id]
      );

      if(delete_res){
        return res.json({
          status: 200,
          msg: "Plan deleted successfully",
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
        msg: "No Plan found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

module.exports = { FetchAllPlan, AddPlan, PurchaseNewPlan,UpdatePlan,DeletePlan };
