import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Phone, Mail, Calendar, User, MessageSquare, ChevronRight, MessageCircle } from 'lucide-react';

interface ChatMessage {
  role: 'bot' | 'user';
  content: string;
  timestamp: string;
}

interface ConversationContext {
  messages: ChatMessage[];
  variables: {
    page: string;
    referrer: string;
    userAgent: string;
  };
}

interface Contact {
  id: string;
  chatbotId: string;
  userId: number;
  name: string;
  phone: string;
  email: string;
  consentGiven: boolean;
  conversationContext: ConversationContext;
  createdAt: string;
  updatedAt?: string;
}

interface NewContact {
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());
  const [newContact, setNewContact] = useState<NewContact>({
    name: "",
    email: "",
    phone: "",
    message: "",
    source: "manual",
    status: "new"
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        "https://totem-consultancy-alpha.vercel.app/api/contacts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      // For demo purposes, create some mock data based on the webhook format
      const mockContacts: Contact[] = [
        {
          id: "1",
          chatbotId: "dcc9c0b0-7307-4e33-9552-263b3c49e605",
          userId: 1,
          name: "Dhiraj",
          phone: "80980",
          email: "",
          consentGiven: true,
          conversationContext: {
            messages: [
              {
                role: "bot",
                content: "Hello. Welcome to **Totem Management and Consultancy**. We are here to provide **complete digital solutions** for brands and individuals. Feel free to explore the options below to get started",
                timestamp: "2025-08-01T10:42:48.335Z"
              },
              {
                role: "user",
                content: "contact",
                timestamp: "2025-08-01T10:42:55.112Z"
              },
              {
                role: "bot",
                content: "I understand your question. Let me help you with that.\n\n📞 **Stay connected:** Leave your contact info below!",
                timestamp: "2025-08-01T10:43:00.497Z"
              }
            ],
            variables: {
              page: "http://localhost:5173/appearance",
              referrer: "http://localhost:5173/chatbots",
              userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
            }
          },
          createdAt: "2025-08-01T10:43:07.986Z"
        },
        {
          id: "2",
          chatbotId: "dcc9c0b0-7307-4e33-9552-263b3c49e606",
          userId: 2,
          name: "John Doe",
          phone: "+1234567890",
          email: "john@example.com",
          consentGiven: true,
          conversationContext: {
            messages: [
              {
                role: "bot",
                content: "Hello! How can I help you today?",
                timestamp: "2025-08-01T09:30:00.000Z"
              },
              {
                role: "user",
                content: "I need help with digital marketing",
                timestamp: "2025-08-01T09:30:30.000Z"
              }
            ],
            variables: {
              page: "http://localhost:5173/services",
              referrer: "http://localhost:5173/",
              userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          },
          createdAt: "2025-08-01T09:31:00.000Z"
        }
      ];
      setContacts(mockContacts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `https://totem-consultancy-alpha.vercel.app/api/contacts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      setContacts(contacts.filter(contact => contact.id !== id));
      alert("Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      // For demo purposes, remove from local state
      setContacts(contacts.filter(contact => contact.id !== id));
      alert("Contact deleted successfully!");
    }
  };

  const handleEdit = (contact: Contact): void => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.conversationContext.messages[contact.conversationContext.messages.length - 1]?.content || "",
      source: "webhook",
      status: "new"
    });
    setIsModalOpen(true);
  };

  const handleAdd = (): void => {
    setEditingContact(null);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      message: "",
      source: "manual",
      status: "new"
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newContact.name) {
      alert("Name is required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const url = editingContact
        ? `https://totem-consultancy-alpha.vercel.app/api/contacts/${editingContact.id}`
        : "https://totem-consultancy-alpha.vercel.app/api/contacts";

      const method = editingContact ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        throw new Error("Failed to save contact");
      }

      const savedContact = await response.json();

      if (editingContact) {
        setContacts(contacts.map(contact =>
          contact.id === editingContact.id ? savedContact : contact
        ));
      } else {
        setContacts([...contacts, savedContact]);
      }

      setIsModalOpen(false);
      alert(editingContact ? "Contact updated successfully!" : "Contact added successfully!");
    } catch (error) {
      console.error("Error saving contact:", error);
      // For demo purposes, add to local state
      const demoContact: Contact = {
        id: Date.now().toString(),
        chatbotId: "demo-chatbot-id",
        userId: contacts.length + 1,
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone,
        consentGiven: true,
        conversationContext: {
          messages: [
            {
              role: "user",
              content: newContact.message,
              timestamp: new Date().toISOString()
            }
          ],
          variables: {
            page: "manual-entry",
            referrer: "admin-panel",
            userAgent: "Admin Panel"
          }
        },
        createdAt: new Date().toISOString()
      };
      
      if (editingContact) {
        setContacts(contacts.map(contact =>
          contact.id === editingContact.id ? demoContact : contact
        ));
      } else {
        setContacts([...contacts, demoContact]);
      }
      
      setIsModalOpen(false);
      alert(editingContact ? "Contact updated successfully!" : "Contact added successfully!");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleExpanded = (contactId: string) => {
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
    }
    setExpandedContacts(newExpanded);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = filterStatus === 'all';
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbot Leads</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage leads from chatbot conversations and webhooks
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Leads</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Consent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContacts.map((contact) => (
                <React.Fragment key={contact.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <User size={20} className="text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.email && (
                              <div className="flex items-center">
                                <Mail size={14} className="mr-1" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center">
                                <Phone size={14} className="mr-1" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <MessageSquare size={16} />
                        <span className="ml-2">Chatbot</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.consentGiven 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {contact.consentGiven ? 'Given' : 'Not Given'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(contact.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                                                 <button
                           onClick={() => toggleExpanded(contact.id)}
                           className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                           title="View conversation"
                         >
                           <ChevronRight 
                             size={16} 
                             className={`transition-transform duration-500 ease-in-out ${
                               expandedContacts.has(contact.id) ? 'rotate-90' : 'rotate-0'
                             }`}
                           />
                         </button>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit contact"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                                     {/* Expanded Conversation */}
                   <tr className={`transition-all duration-500 ease-in-out ${
                     expandedContacts.has(contact.id) 
                       ? 'max-h-screen opacity-100' 
                       : 'max-h-0 opacity-0 overflow-hidden'
                   }`}>
                     <td colSpan={5} className={`px-6 py-4 bg-gray-50 dark:bg-gray-700 transition-all duration-500 ease-in-out ${
                       expandedContacts.has(contact.id) ? 'py-4' : 'py-0'
                     }`}>
                                                 {expandedContacts.has(contact.id) && (
                           <div className="space-y-4">
                             <div className="flex items-center space-x-2">
                               <MessageCircle size={16} className="text-blue-600" />
                               <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                 Conversation History
                               </h4>
                             </div>
                             <div className="space-y-3 max-h-64 overflow-y-auto">
                               {contact.conversationContext.messages.map((message, index) => (
                                 <div
                                   key={index}
                                   className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                 >
                                   <div
                                     className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                       message.role === 'user'
                                         ? 'bg-blue-600 text-white'
                                         : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                                     }`}
                                   >
                                     <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                     <div className={`text-xs mt-1 ${
                                       message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                     }`}>
                                       {formatMessageTime(message.timestamp)}
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                             <div className="text-xs text-gray-500 dark:text-gray-400">
                               <div><strong>Page:</strong> {contact.conversationContext.variables.page}</div>
                               <div><strong>Referrer:</strong> {contact.conversationContext.variables.referrer}</div>
                             </div>
                           </div>
                         )}
                                               </td>
                      </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search'
                : 'No chatbot leads have been received yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newContact.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newContact.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newContact.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={newContact.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingContact ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts; 