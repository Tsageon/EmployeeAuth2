import React, { useState, useRef, useEffect } from "react";
import { db } from "../config/fire";
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import axios from "axios";
import Swal from 'sweetalert2';
import "./app2.css";

function Form() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [id, setId] = useState('')
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    gender: "",
    email: "",
    phone: "",
    image: "",
    position: "",
    idNumber: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("form");
  const searchTimeoutRef = useRef(null);

  const validate = () => {

    let tempErrors = {};
  
    if (!newEmployee.idNumber || newEmployee.idNumber.trim() === "") {
      tempErrors.idNumber = "Please enter a valid ID number.";
    } else if (!/^\d{13}$/.test(newEmployee.idNumber)) {
      tempErrors.idNumber = "ID number must be exactly 13 digits.";
    }

    tempErrors.name = newEmployee.name ? "" : "This field is required.";
    

    tempErrors.gender = newEmployee.gender ? "" : "What's Your Gender?";
  

    tempErrors.email = newEmployee.email
      ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmployee.email)
        ? ""
        : "Please enter a valid email address."
      : "This field is required.";
  
    tempErrors.phone = newEmployee.phone
      ? /^\d{10}$/.test(newEmployee.phone)
        ? ""
        : "Phone number must be 10 digits."
    
        : "This field is required.";

    tempErrors.position = newEmployee.position ? "" : "Position is required.";
  
    setErrors(tempErrors);
    console.log("Validation results:", tempErrors);
  
    const hasErrors = Object.values(tempErrors).some((x) => x !== "");
  
    if (hasErrors) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "There are validation errors. Please correct them.",
      });
      return false;
    }
  
    return true;
  
  };
  
  
  const resetForm = () => {
    setNewEmployee({
      name: "",
      gender: "",
      email: "",
      phone: "",
      image: "",
      position: "",
      idNumber: "",
    });
    document.querySelector("input[type='file']").value = "";
    setIsEditing(false);
    setCurrentEmployeeId("");
    setErrors({});
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("https://auhtemployeebackend.onrender.com/api/getEmployee");
      const employeeList = response.data.data;
      console.log(employeeList);
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error fetching employees from the server", error);

      Swal.fire({
        icon: 'error',
        title: 'Error Fetching Employees',
        text: 'There was an issue fetching employee data. Please try again later.',
        footer: 'If the issue persists, contact support.'
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    try {
      const employeeDoc = doc(db, "employees", id);
      await deleteDoc(employeeDoc);
      await axios.delete(`https://auhtemployeebackend.onrender.com/api/deleteEmployee/${id}`);
      setEmployees(employees.filter((employee) => employee.id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Employee Deleted',
        text: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error("Error deleting employee", error);
      Swal.fire({
        icon: 'error',
        title: 'Error Deleting Employee',
        text: 'There was an issue deleting the employee data. Please try again later.',
        footer: 'If the issue persists, contact support.'
      });
    }
  };

  const editEmployee = (employee) => {
    console.log("Editing employee:", employee);
    setNewEmployee({
      name: employee.Name,
      email: employee.email,
      phone: employee.phoneNumber,
      gender: employee.Gender,
      position: employee.Position,
      idNumber: employee.id,
    });
    setId(employee.id); 
    setIsEditing(true);
    setCurrentEmployeeId(employee.id); 
    setActiveTab("form");
    console.log(id);
  };
  

  const handleUpdate = async () => {
    const employeeData = {
      Name: newEmployee.name,
      email: newEmployee.email,
      Picture: newEmployee.image || null,
      phoneNumber: newEmployee.phone,
      Gender: newEmployee.gender,
      Position: newEmployee.position,
    };
  
    console.log("Employee Data to Update:", employeeData);
  
    try {
      await axios.put(`https://auhtemployeebackend.onrender.com/api/updateEmployee/${currentEmployeeId}`, employeeData);
  
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === currentEmployeeId ? { ...employee, ...newEmployee } : employee
        )
      );
  
      Swal.fire({
        icon: "success",
        title: "Employee Updated",
        text: "The employee data was successfully updated.",
      });
    } catch (error) {
      console.log(error.message);
  
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an issue updating the employee data. Please try again.",
      });
    }
  };
  
  


  const isEmployeeIdUnique = async (employeeId) => {
    const employeesCollectionRef = collection(db, "employees");
    const querySnapshot = await getDocs(employeesCollectionRef);
    return !querySnapshot.docs.some(
      (doc) => doc.data().employeeId === employeeId
    );
  };


  const handleSubmit = async () => {
    if (!validate()) return;
  
    const employeeData = {
      Name: newEmployee.name,
      email: newEmployee.email,
      Picture: newEmployee.image || null,
      Id: newEmployee.idNumber,
      phoneNumber: newEmployee.phone,
      Gender: newEmployee.gender,
      Position: newEmployee.position,
    };
   

  
    console.log("Payload being sent to backend:", employeeData);

  
    try {
      const isUnique = await isEmployeeIdUnique(newEmployee.idNumber);
      if (!isUnique) {
        Swal.fire({
          icon: "error",
          title: "Employee ID Already Exists",
          text: "An employee with this ID already exists.",
          confirmButtonText: "OK",
        });
        return;
      }
  
      await axios.post("https://auhtemployeebackend.onrender.com/api/addEmployee", employeeData);
  
      Swal.fire({
        icon: "success",
        title: "Employee Added Successfully!",
        text: "The employee was successfully added.",
        confirmButtonText: "OK",
      });
  
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Error Submitting Employee Data",
        text: error.response?.data?.message || "An unknown error occurred.",
        footer: "If the issue persists, contact support.",
        confirmButtonText: "OK",
      });
    }    
  };
  



  const handleSearch = () => {
    setFilteredEmployees(
      employees.filter(
        (employee) =>
          (employee.name &&
            employee.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.employeeId && employee.employeeId.includes(searchQuery))
      )
    );
    setActiveTab("list");
  };
  

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 300);
  };

  console.log("State on change:", newEmployee);
  console.log("Validating ID:", newEmployee.idNumber);


  const renderForm = () => (
    <div className="The Form">
      <input
        type="text"
        placeholder="Name"
        value={newEmployee.name || ""}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, name: e.target.value })
        }
      />
      <div className="error">{errors.name}</div>
  
      <input
        type="email"
        placeholder="Email"
        value={newEmployee.email || ""}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, email: e.target.value })
        }
      />
      <div className="error">{errors.email}</div>
  
      <input
        type="text"
        placeholder="PhoneNumber"
        value={newEmployee.phone || ""}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, phone: e.target.value })
        }
      />
      <div className="error">{errors.phone}</div>
  
      <input
  type="text"
  placeholder="Enter image URL"
  value={newEmployee.image || ""}
  onChange={(e) => setNewEmployee({ ...newEmployee, image: e.target.value })}
/>
      <div className="error">{errors.image}</div>
  
      <select
        className="styled-select"
        value={newEmployee.gender || ""}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, gender: e.target.value })
        }
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <div className="error">{errors.gender}</div>
  
      <input
        type="text"
        placeholder="Position"
        value={newEmployee.position || ""}
        onChange={(e) =>
          setNewEmployee({ ...newEmployee, position: e.target.value })
        }
      />
      <div className="error">{errors.position}</div>
  
      <div>
        <input
          type="text"
          placeholder="ID Number"
          value={newEmployee.idNumber || ""}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, idNumber: e.target.value })
          }
        />
        {errors.idNumber && <span className="error">{errors.idNumber}</span>}  {/* Fix here */}
      </div>
  
      {isEditing ? (
        <button className="edit-btns" onClick={handleUpdate}>
          Update
        </button>
      ) : (
        <button className="submit-btns" onClick={handleSubmit}>
          Submit
        </button>
      )}
  
      {isEditing && <button onClick={resetForm}>Cancel</button>}
    </div>
  );
  

  const renderEmployeeList = () => (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Profile Picture</th>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Position</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(searchQuery ? filteredEmployees : employees).length > 0 ? (
            (searchQuery ? filteredEmployees : employees).map((employee) => (
              <tr key={employee.id}>
                <td>
                  {employee.Picture ? (
                    <img
                      src={employee.Picture}
                      alt={employee.name || "Employee image"}
                       className="employee-image"
                    />
                  ) : (
                    "No image"
                  )}
                </td>
                <td>{employee.Name}</td>
                <td>{employee.email}</td>
                <td>{employee.Gender}</td>
                <td>{employee.phoneNumber}</td>
                <td>{employee.Position}</td>
                <td>{employee.Id}</td>
                <td>
                  <button
                    className="edit"
                    onClick={() => editEmployee(employee)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete"
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No employees yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSearch = () => (
    <>
      <input
        type="text"
        placeholder="Search for employee"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <button className="search" onClick={handleSearch}>
        Search
      </button>
    </>
  );

  return (
    <div className="app">
      <h1>Employee Registration Form</h1>
      <div className="tabs">
        <button
          onClick={() => setActiveTab("form")}
          className={activeTab === "form" ? "active-tab" : ""}
        >
          Employee Form
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={activeTab === "list" ? "active-tab" : ""}
        >
          Employee List
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={activeTab === "search" ? "active-tab" : ""}
        >
          Search
        </button>
      </div>
      {activeTab === "form" && (
        <div>
          <h2 className="Two-headings">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h2>
          {renderForm()}
        </div>
      )}
      {activeTab === "list" && (
        <div>
          <h2 className="Two-headings">Employee List</h2>
          {renderEmployeeList()}
        </div>
      )}
      {activeTab === "search" && (
        <div>
          <h2 className="Query-heading">Employee Query</h2>
          {renderSearch()}
          { }
          {searchQuery && renderEmployeeList()}
        </div>
      )}
    </div>
  );
}

export default Form;