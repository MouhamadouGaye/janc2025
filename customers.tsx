import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import {fetchCustomers, postCustomers, fetchCustomerStatus, deleteCustumer} from ../api/custumerServices 
import type { Customer, CustomerRequestBody } from "../types";
import AddCustomerModal from "./AddCustomerModal";
import { useAuth } from "../hooks/AuthContext";
import User from "./User";
import { Link } from "react-router-dom";

type Props = {};

const Customers: React.FC<Props> = ({ isDarkMode }) => {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const customersPerPage = 10;

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);


  useEffect(() => {
    const fetchCustomers = async () => {
      setError(null);
      setLoading(true);

      const start = Date.now(); // Track the start time
      try {
        const response = await fetch("http://localhost:3001/api/customers");
        if (!response.ok) throw new Error("Failed to fetch customers");
        const data = await response.json();

        const elapsedTime = Date.now() - start; // Calculate elapsed time
        const remainingTime = Math.max(1000 - elapsedTime, 0); // Calculate remaining time to 1 second
        await new Promise((resolve) => setTimeout(resolve, remainingTime)); // Ensure at least 1 second

        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchUsers()
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, []);

  const handleAddCustomer = async (customer: CustomerRequestBody) => {
    try {
      const response = await fetch("http://localhost:3001/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });
      if (!response.ok) throw new Error("Failed to add customer");
      const newCustomer = await response.json();
      setCustomers((prev) => (prev ? [...prev, newCustomer] : [newCustomer]));
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCustomer = async (customer: Customer) => {
    try {
      const response = await PostCostumer()
     
      if (!response.ok) throw new Error("Failed to update customer");
      const updatedCustomer = await response.json();
      setCustomers((prev) =>
        prev
          ? prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
          : []
      );
      setIsModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await deleteCustomer()
        if (!response.ok) throw new Error("Failed to delete customer");
        setCustomers((prev) => (prev ? prev.filter((c) => c.id !== id) : []));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetchCustumerStatus()
      if (!response.ok) throw new Error("Failed to update status");
      const updatedCustomer = await response.json();
      setCustomers((prev) =>
        prev ? prev.map((c) => (c.id === id ? updatedCustomer : c)) : []
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col space-y-4  p-6 ${
        isDarkMode ? "bg-gray-900 text-white" : "text-slate-500"
      }`}
    >
      <User />
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Customers</h2>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center shadow-md hover:bg-blue-700 transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
        <table className="min-w-full divide-y divide-gray-200 border-b border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Email", "Status", "Assigned To", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      customer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : customer.status === "inactive"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                    value={customer.status}
                    onChange={(e) =>
                      handleStatusChange(customer.id, e.target.value)
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.assigned_to_name || "Unassigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <select
                    className="bg-gray-200 p-2 rounded-md"
                    onChange={(e) => {
                      const action = e.target.value;
                      if (action === "edit") {
                        setSelectedCustomer(customer);
                        setIsModalOpen(true);
                      } else if (action === "delete") {
                        handleDeleteCustomer(customer.id);
                      }
                    }}
                  >
                    <option value=""></option>
                    <option value="edit">Edit</option>
                    <option value="delete">Delete</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={(data) => {
          if (selectedCustomer) {
            handleEditCustomer({ ...selectedCustomer, ...data });
          } else {
            handleAddCustomer(data);
          }
        }}
        users={users}
        initialData={selectedCustomer || undefined}
      />
    </div>
  );
};

export default Customers;
