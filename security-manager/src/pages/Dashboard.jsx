import { useSecurity } from '../contexts/SecurityContext';
import { Car, Users, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const { vehicles, visitors, checkInOuts } = useSecurity();

  const activeCheckIns = checkInOuts.filter(c => c.status === 'checked-in').length;
  const completedCheckOuts = checkInOuts.filter(c => c.status === 'checked-out').length;

  const recentActivity = checkInOuts.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Security checkpoint overview</p>
      </header>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Vehicles */}
        <div className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">Total Vehicles</p>
            <Car className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-gray-900">{vehicles.length}</div>
        </div>

        {/* Total Visitors */}
        <div className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">Total Visitors</p>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-gray-900">{visitors.length}</div>
        </div>

        {/* Active Check-ins */}
        <div className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">Active Check-ins</p>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="mt-3 text-3xl font-bold text-green-600">{activeCheckIns}</div>
        </div>

        {/* Completed Check-outs */}
        <div className="bg-white rounded-2xl shadow hover:shadow-md transition p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">Completed Check-outs</p>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="mt-3 text-3xl font-bold text-red-500">{completedCheckOuts}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="bg-white rounded-2xl shadow border border-gray-100 p-6">
       

        {recentActivity.length === 0 ? (
          <>
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-base font-medium text-gray-700">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">Everything is quiet for now.</p>
            </div>
          </>
        ) : (
          <>
           <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
             <ul className="divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.itemName}</p>
                  <p className="text-xs text-gray-500">{activity.checkpointName}</p>
                  <p className="text-xs text-gray-500">
                    {activity.type === 'vehicle'
                      ? `Driver: ${activity.driverName}`
                      : 'Visitor'}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize ${activity.status === 'checked-in'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {activity.status}
                  </span>
                  <p className="text-xs text-gray-400 capitalize">{activity.shift} shift</p>
                </div>
              </li>
            ))}
          </ul>
          </>
        
        )}
      </section>
    </div>
  );
};

export default Dashboard;
