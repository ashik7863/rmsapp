const DB = require('../config');
const {deleteFile} = require('../DeleteFile');
const dbInstance = new DB();

function generateEmpId() {
  const prefix = 'STF';
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000); 
  return `${prefix}${randomDigits}`;
}


// Function to add a staff member
const AddStaffMember = async (req, res) => {
  try {
    await dbInstance.connect();

    // Extract fields from the request body and file
    const {
      rst_id,
      name,
      dob,
      mobile,
      gender,
      email,
      address,
      role,
      salary,
      bank,
      acc_no,
      ifsc,
      status
    } = req.body;
    // const picture = req.file ? req.file.filename : null;

    let { image, aadhaar, voter, qualification } = req.files;


      image= image ? image[0].path : null,
      aadhaar= aadhaar ? aadhaar[0].path : null,
      voter= voter ? voter[0].path : null,
      qualification= qualification ? qualification[0].path : null

    // Check for duplicates
    const duplicateCheck = await dbInstance.num(
      `SELECT id FROM staff WHERE name = ? AND mobile = ?`,
      [name, mobile]
    );

    if (duplicateCheck > 0) {
      return res.json({
        status: 500,
        msg: "Duplicate Staff Member",
      });
    }

    // Insert new staff member
    let staff_id = generateEmpId();
    const result = await dbInstance.query(
      `INSERT INTO staff (rst_id,emp_id, name, dob, mobile, gender, email, address,
       role, salary, bank, acc_no, ifsc, status, image,aadhaar,voter,qualification)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
      [rst_id,staff_id, name, dob, mobile, gender, email, address, role, salary, bank,
         acc_no, ifsc, 'Active', image,aadhaar,voter,qualification]
    );

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Staff Member Created Successfully",
      });
    } else {
      return res.json({
        status: 400,
        msg: "Error While Adding Staff Member",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};


const UpdateStaffMember = async (req, res) => {
  try {
    await dbInstance.connect();
    // Extract fields from the request body and file
    const {
      id,
      name,
      dob,
      mobile,
      gender,
      email,
      address,
      role,
      salary,
      bank,
      acc_no,
      ifsc,
      status,
      oldImage,
      oldAadhaar,
      oldVoter,
      oldCertificate
    } = req.body;


    let { image, aadhaar, voter, qualification } = req.files;

    if(image){
      deleteFile(oldImage);
    }
    if(aadhaar){
      deleteFile(oldAadhaar);
    }
    if(voter){
      deleteFile(oldVoter);
    }
    if(qualification){
      deleteFile(oldCertificate);
    }
    image= image ? image[0].path : oldImage,
    aadhaar= aadhaar ? aadhaar[0].path : oldAadhaar,
    voter= voter ? voter[0].path : oldVoter,
    qualification= qualification ? qualification[0].path : oldCertificate

    

    // Check for Existing
    const existingStaff = await dbInstance.num(
      `SELECT id FROM staff WHERE id = ?`,
      [id]
    );

    if (existingStaff==0) {
      return res.json({
        status: 404,
        msg: "Staff not found",
      });
    }

    // Update staff member
    const result = await dbInstance.query(
      `UPDATE staff 
       SET name = ?, dob = ?, mobile = ?, gender = ?, email = ?, address = ?, role = ?,
        salary = ?, bank = ?, acc_no = ?, ifsc = ?, status = ?, image = ?,aadhaar=?,voter=?,
        qualification=? WHERE id = ?`,
      [name, dob, mobile, gender, email, address, role, salary, bank, acc_no, ifsc,
         status, image,aadhaar,voter,qualification, id]
    );
    

    if (result.affectedRows > 0) {
      return res.json({
        status: 200,
        msg: "Staff Member Updated Successfully",
      });
    } else {
      return res.json({
        status: 400,
        msg: "Error While Updating Staff Member",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};


const FetchAllStaff = async (req, res) => {
  try {
    await dbInstance.connect();
    let { id } = req.params;
    let rst_id = atob(id);

    // Fetch all menu items for the given restaurant
    const staff = await dbInstance.fetch(
      `SELECT * FROM staff WHERE rst_id=? ORDER BY id DESC`,
      [rst_id]
    );

    if (staff.length > 0) {
      return res.json({
        status: 200,
        data: staff,
        msg: "Staff fetched successfully",
      });
    } else {
      return res.json({
        status: 404,
        msg: "No staff found",
      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

const DeleteStaff = async (req, res) => {
  try {
    await dbInstance.connect();
    let {id}=req.body;

    const staff = await dbInstance.num(
      `SELECT id 
       FROM staff WHERE id=?`,
       [id]
    );

    if (staff > 0) {

      const delete_staff = await dbInstance.query(
        `DELETE 
         FROM staff WHERE id=?`,
         [id]
      );

      if(delete_staff){
        return res.json({
          status: 200,
          msg: "Staff deleted successfully",
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
        msg: "No staff found",
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await dbInstance.close();
  }
};

module.exports = {
  AddStaffMember,FetchAllStaff,DeleteStaff,UpdateStaffMember
};

