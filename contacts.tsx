import { useState, useEffect } from "react";
import axios from "axios";
import AddEditContactModal from "./AddEditContactModal";
import User from "./User";
import ActionDropdown from "./contact/ContactAction";
import { Contact } from "../types";
import { fetchContacts as fetchContactsService } from "../api/contactServices";

interface ContactProps {
  contact: Contact[];
  isDarkMode: boolean;
}

const Contacts: React.FC<ContactProps> = ({ isDarkMode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const contactsPerPage = 10;

  // // Fetch contacts
  // const fetchContacts = async () => {
  //   try {
  //     const response = await axios.get<Contact[]>(
  //       "http://localhost:3001/api/contacts"
  //     );
  //     setContacts(response.data);
  //   } catch (error) {
  //     console.error("Failed to fetch contacts:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchContacts();
  // }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      setError(null);
      setLoading(true);

      const start = Date.now(); // Track the start time 😀start
      try {
        const data = await fetchContactsService();

        const elapsedTime = Date.now() - start; // Calculate elapsed time 😀finish
        const remainingTime = Math.max(500 - elapsedTime, 0); // Calculate remaining time to 1 second
        await new Promise((resolve) => setTimeout(resolve, remainingTime)); // Ensure at least 1 second

        setContacts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter and paginate contacts
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const currentContacts = filteredContacts.slice(
    (currentPage - 1) * contactsPerPage,
    currentPage * contactsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const toggleContactSelection = (id: number) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id]
    );
  };

  const openModal = (contact: Contact | null = null) => {
    setCurrentContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentContact(null);
    setIsModalOpen(false);
    fetchContacts();
  };

  const bulkDelete = async () => {
    if (!window.confirm("Are you sure you want to delete selected contacts?"))
      return;

    try {
      await Promise.all(
        selectedContacts.map((id) =>
          axios.delete(`http://localhost:3001/api/contacts/${id}`)
        )
      );
      setSelectedContacts([]);
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contacts:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchContacts();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Aeure Implementations
  // const fetchContacts = async () => {
  //   try {
  //     const accessToken = await msalInstance.acquireTokenSilent({
  //       scopes: ["Mail.Read"],
  //     });

  //     const emails = await fetchEmails(accessToken.accessToken);
  //     // Process and log emails into interactions
  //     console.log("Fetched Emails:", emails);

  //     // Fetch existing contacts
  //     const response = await axios.get<Contact[]>(
  //       "http://localhost:3001/api/contacts"
  //     );
  //     const contactsWithEmails = response.data.map((contact) => {
  //       const contactEmails = emails.filter(
  //         (email) => email.sender.emailAddress.address === contact.email
  //       );
  //       return { ...contact, interactions: contactEmails };
  //     });
  //     setContacts(contactsWithEmails);
  //   } catch (error) {
  //     console.error("Failed to fetch contacts or emails:", error);
  //   }
  // };
  // End Azure Implementations

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
      className={`min-h-screen bg-gray-100 p-6 ${
        isDarkMode ? "bg-gray-900 text-cyan-600" : "text-gray-900"
      }`}
    >
      <User />
      <div
        className={`flex justify-between items-center mb-6  ${
          isDarkMode ? "bg-gray-900 text-cyan-600" : "text-gray-900"
        }`}
      >
        <h1 className="text-3xl font-semibold text-gray-700">Contacts</h1>
        <button
          className="px-4 py-2 border-cyan-500 border-2 text-cyan-500 rounded hover:bg-cyan-400 hover:text-cyan-700 transition duration-300"
          onClick={() => openModal()}
        >
          Add Contact
        </button>
      </div>

      <div className="mb-4 flex gap-4 ">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2 border border-gray-600 rounded focus:ring focus:ring-blue-500 ${
            isDarkMode ? "bg-gray-900 text-white focus:ring-cyan-500" : ""
          } `}
        />
        {selectedContacts.length > 0 && (
          <button
            className="px-4 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition w-fit"
            onClick={bulkDelete}
          >
            Delete ({selectedContacts.length})
          </button>
        )}
      </div>

      <div
        className={`overflow-hidden bg-white shadow rounded-lg ${
          isDarkMode ? "bg-gray-900 text-cyan-600" : "text-gray"
        }`}
      >
        <table
          className={`min-w-full table-auto ${
            isDarkMode ? "bg-gray-900 text-cyan-600" : "text-gray-900"
          }`}
        >
          <thead
            className={` ${
              isDarkMode ? "bg-gray-800 text-cyan-600" : "text-gray-900"
            }`}
          >
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedContacts(
                      e.target.checked ? contacts.map((c) => c.id) : []
                    )
                  }
                  checked={selectedContacts.length === contacts.length}
                />
              </th>
              <th className="p-4 text-left text-sm font-medium">Name</th>
              <th className="p-4 text-left text-sm font-medium">Email</th>
              <th className="p-4 text-left text-sm font-medium">Phone</th>
              <th className="p-4 text-left text-sm font-medium">Position</th>
              <th className="p-4 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentContacts.length > 0 ? (
              currentContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-800">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                    />
                  </td>
                  <td className="p-4 text-gray-400">{contact.name}</td>
                  <td className="p-4 text-gray-400">
                    {contact.email || "N/A"}
                  </td>
                  <td className="p-4 text-gray-400">
                    {contact.phone || "N/A"}
                  </td>
                  <td className="p-4 text-gray-400">
                    {contact.position || "N/A"}
                  </td>
                  <td className="p-4 flex gap-2 items-center">
                    <ActionDropdown contact={contact} />
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => openModal(contact)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => bulkDelete()}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div
          className={`p-4 flex justify-between items-center bg-gray-100 ${
            isDarkMode ? "bg-gray-800 text-white" : ""
          } `}
        >
          <button
            className={`px-4 py-2 bg-gray-700 rounded ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-400"
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-cyan-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`px-4 py-2 bg-gray-700 rounded ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-400"
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <AddEditContactModal contact={currentContact} onClose={closeModal} />
      )}
    </div>
  );
};

export default Contacts;
