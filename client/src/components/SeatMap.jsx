import React, { useState } from 'react';

// Mock data for a train coach (60 seats)
const generateMockSeats = () => {
  const seats = [];
  for (let i = 1; i <= 60; i++) {
    // Randomly assign some seats as occupied
    const isOccupied = Math.random() < 0.3;
    seats.push({
      id: i,
      seatNumber: `S1-${i}`,
      status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
    });
  }
  return seats;
};

const SeatMap = ({ onSeatSelect }) => {
  const [seats] = useState(generateMockSeats());
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'OCCUPIED') return;

    let newSelection;
    if (selectedSeatIds.includes(seat.id)) {
      newSelection = selectedSeatIds.filter((id) => id !== seat.id);
    } else {
      newSelection = [...selectedSeatIds, seat.id];
    }
    
    setSelectedSeatIds(newSelection);
    if (onSeatSelect) onSeatSelect(newSelection);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 font-sans">Select Your Seats (Coach S1)</h2>
      
      {/* Legend */}
      <div className="flex gap-6 mb-8 text-sm font-medium text-gray-600 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-100 border border-green-300"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500 border border-blue-600 shadow-sm shadow-blue-200"></div>
          <span className="text-blue-700">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-100 border border-red-200 cursor-not-allowed opacity-70"></div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Seat Grid Layout (Similar to Indian Railways Sleeper Coach) */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-4 gap-x-12 gap-y-4 justify-items-center">
          {seats.map((seat) => {
            const isSelected = selectedSeatIds.includes(seat.id);
            const isOccupied = seat.status === 'OCCUPIED';

            let baseClasses = "w-12 h-12 rounded-t-lg rounded-b-sm flex items-center justify-center font-bold text-xs transition-all duration-200 ";
            
            if (isOccupied) {
              baseClasses += "bg-red-100 text-red-400 border border-red-200 cursor-not-allowed opacity-70";
            } else if (isSelected) {
              baseClasses += "bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-200 transform scale-105";
            } else {
              baseClasses += "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 hover:shadow cursor-pointer";
            }

            return (
              <div 
                key={seat.id} 
                onClick={() => handleSeatClick(seat)}
                className={baseClasses}
                title={seat.seatNumber}
              >
                {seat.id}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-6">
        <div className="text-gray-700 font-medium">
          Selected: <span className="text-blue-600 font-bold">{selectedSeatIds.length}</span> seat(s)
        </div>
        <button 
          disabled={selectedSeatIds.length === 0}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Proceed to Book
        </button>
      </div>
    </div>
  );
};

export default SeatMap;
