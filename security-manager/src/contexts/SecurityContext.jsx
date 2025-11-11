import React, { createContext, useContext, useState } from 'react';

// Create Context
const SecurityContext = createContext();

// Provider
export const SecurityProvider = ({ children }) => {
  const [vehicles, setVehicles] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [checkInOuts, setCheckInOuts] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: '1',
    name: 'John Security',
    badgeNumber: 'SEC001',
  });

  const securityPersonnel = [
    { id: '1', name: 'John Security', badgeNumber: 'SEC001' },
    { id: '2', name: 'Jane Guard', badgeNumber: 'SEC002' },
    { id: '3', name: 'Mike Watch', badgeNumber: 'SEC003' },
  ];

  // Add new vehicle
  const addVehicle = (vehicle) => {
    setVehicles((prev) => [...prev, vehicle]);
  };

  // SecurityContext.jsx
const updateVehicle = (id, updates) => {
  setVehicles((prev) =>
    prev.map((vehicle) =>
      vehicle.id === id ? { ...vehicle, ...updates } : vehicle
    )
  );
};

const deleteVehicle = (id) => {
  setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
};

  // Add new visitor
  const addVisitor = (visitor) => {
    setVisitors((prev) => [...prev, visitor]);
  };


    const updateVisitor = (id, updates) => {
    setVisitors((prev) =>
      prev.map((visitor) =>
        visitor.id === id ? { ...visitor, ...updates } : visitor
      )
    );
  };

  const deleteVisitor = (id) => {
    setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));
  };
  // Add new check-in/out record
  const addCheckInOut = (checkInOut) => {
    setCheckInOuts((prev) => [...prev, checkInOut]);
  };

  // Update check-in/out status
  const updateCheckInOut = (id, updates) => {
    setCheckInOuts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // Add driver to a vehicle
  const addDriver = (vehicleId, driver) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              drivers: [...(vehicle.drivers || []), driver],
            }
          : vehicle
      )
    );
  };

    const updateDriver = (vehicleId, driverId, updates) => {
    setVehicles((prev) =>
      prev.map((vehicle) => {
        if (vehicle.id === vehicleId) {
          const updatedDrivers = (vehicle.drivers || []).map((driver) =>
            driver.id === driverId ? { ...driver, ...updates } : driver
          );
          return { ...vehicle, drivers: updatedDrivers };
        }
        return vehicle;
      })
    );
  };

  const deleteDriver = (vehicleId, driverId) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              drivers: (vehicle.drivers || []).filter(
                (driver) => driver.id !== driverId
              ),
            }
          : vehicle
      )
    );
  };
  // Add a checkpoint
  const addCheckpoint = (checkpoint) => {
    setCheckpoints((prev) => [...prev, checkpoint]);
  };

  return (
<SecurityContext.Provider
  value={{
    vehicles,
    visitors,
    checkInOuts,
    checkpoints,
    securityPersonnel,
    currentUser,
    addVehicle,
    addVisitor,
    addCheckInOut,
    updateCheckInOut,
    setCurrentUser,
    addDriver,
    addCheckpoint,
    updateVehicle,     // 👈 added
    deleteVehicle,     // 👈 added
    updateDriver,  // ✅ added
    deleteDriver,  // ✅ added
       updateVisitor,
        deleteVisitor,
  }}
>

      {children}
    </SecurityContext.Provider>
  );
};

// Custom Hook
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
