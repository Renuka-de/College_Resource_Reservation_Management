//src/pages/ResourceGrid.js
import React from "react";
import "./RegisterKP.css"; // <-- make sure correct path

const ResourcesGrid = ({ resources, onRoomClick }) => {
  return (
    <div className="room-grid">
      {resources.map((room) => (
        <div
          key={room._id}
          className={`room ${room.availability ? "available" : "booked"}`}
          onClick={() => room.availability && onRoomClick(room)}
        >
          {room.name}
        </div>
      ))}
    </div>
  );
};

export default ResourcesGrid;