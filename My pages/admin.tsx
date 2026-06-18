import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  CreditCard, 
  Activity, 
  ShieldAlert,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Users,
  Settings,
  Bell
} from 'lucide-react';

// --- MOCK DATA GENERATION ---
const generateMockData = () => {
  const plans = [
    { name: 'Basic', price: 9.00, limit: 100 },
    { name: 'Pro', price: 29.00, limit: 500 },
    { name: 'Enterprise', price: 99.00, limit: 2000 }
  ];
  const statuses = ['Active', 'Active', 'Active', 'Past Due']; // Skewed towards active
  
  return Array.from({ length: 42 }, (_, i) => {
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const usageCurrent = Math.floor(Math.random() * plan.limit);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isDisabled = status === 'Past Due' && Math.random() > 0.5;

    return {
      id: i + 1,
      email: `user${i + 1}@example.com`,
      planName: plan.name,
      price: plan.price,
      usageCurrent,
      usageMax: plan.limit,
      status: isDisabled ? 'Disabled' : status,
      isDisabled: isDisabled
    };
  });
};

const initialSubscribers = generateMockData();

// --- COMPONENTS ---

// Custom Toggle Switch
const Toggle = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

// Main App Component
export default function App() {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- LOGIC ---

  const handleToggleDisable = (id) => {
    setSubscribers(current => 
      current.map(sub => {
        if (sub.id === id) {
          const newlyDisabled = !sub.isDisabled;
          return {
            ...sub,
            isDisabled: newlyDisabled,
            status: newlyDisabled ? 'Disabled' : 'Active'
          };
        }
        return sub;
      })
    );
  };

  const filteredData = useMemo(() => {
    return subscribers.filter(sub => 
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscribers, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on changing rows per page
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Mail className="w-6 h-6" />
            <span>DraftFlow</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg transition-colors font-medium">
            <Users className="w-5 h-5" /> Subscribers
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCard className="w-5 h-5" /> Billing
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              A
            </div>
            <div className="text-sm">
              <p className="font-medium">Admin User</p>
              <p className="text-gray-500">admin@draftflow.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-gray-800">Subscriber Management</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-500">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* STATS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg text-green-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscribers.filter(s => !s.isDisabled).length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-lg text-orange-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(subscribers.reduce((acc, curr) => acc + curr.price, 0) / subscribers.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* MAIN TABLE CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* TOOLBAR */}
            <div className="p-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by email or plan..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="bg-white border border-gray-300 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Plan & Price
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Usages
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Disable Account
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((subscriber) => {
                      const usagePercent = Math.min(100, Math.round((subscriber.usageCurrent / subscriber.usageMax) * 100));
                      let progressColor = 'bg-indigo-500';
                      if (usagePercent > 85) progressColor = 'bg-red-500';
                      else if (usagePercent > 70) progressColor = 'bg-orange-400';

                      return (
                        <tr key={subscriber.id} className={`hover:bg-gray-50 transition-colors ${subscriber.isDisabled ? 'bg-gray-50/50' : ''}`}>
                          {/* 1. Registered Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white ${subscriber.isDisabled ? 'bg-gray-300' : 'bg-gradient-to-br from-indigo-500 to-purple-600'}`}>
                                  {subscriber.email.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className={`text-sm font-medium ${subscriber.isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {subscriber.email}
                                </div>
                                <div className="text-sm text-gray-500">ID: #{subscriber.id.toString().padStart(4, '0')}</div>
                              </div>
                            </div>
                          </td>

                          {/* 2 & 3. Plan Name & Price */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${subscriber.isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                              {subscriber.planName}
                            </div>
                            <div className="text-sm text-gray-500">${subscriber.price.toFixed(2)} / month</div>
                          </td>

                          {/* 4. Usages */}
                          <td className="px-6 py-4 whitespace-nowrap w-64">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700">{subscriber.usageCurrent} drafts</span>
                              <span className="text-gray-500">/ {subscriber.usageMax} limit</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${progressColor} h-2 rounded-full transition-all duration-500`} 
                                style={{ width: `${usagePercent}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-right">{usagePercent}% used</div>
                          </td>

                          {/* 5. Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                              ${subscriber.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                subscriber.status === 'Past Due' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                'bg-gray-100 text-gray-700 border-gray-200'}`}
                            >
                              {subscriber.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {subscriber.status === 'Past Due' && <ShieldAlert className="w-3.5 h-3.5" />}
                              {subscriber.status === 'Disabled' && <XCircle className="w-3.5 h-3.5" />}
                              {subscriber.status}
                            </span>
                          </td>

                          {/* 6. Disable Toggle */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                             <Toggle 
                                enabled={subscriber.isDisabled} 
                                onChange={() => handleToggleDisable(subscriber.id)} 
                             />
                             <div className="text-xs text-gray-400 mt-1">
                               {subscriber.isDisabled ? 'Disabled' : 'Active'}
                             </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="h-8 w-8 text-gray-300 mb-3" />
                          <p className="text-base font-medium text-gray-900">No subscribers found</p>
                          <p className="text-sm mt-1">Adjust your search query and try again.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-semibold">{filteredData.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-semibold">{Math.min(startIndex + rowsPerPage, filteredData.length)}</span> of <span className="font-semibold">{filteredData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                          ${currentPage === i + 1 
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>

              {/* Mobile pagination controls */}
              <div className="flex items-center justify-between w-full sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}