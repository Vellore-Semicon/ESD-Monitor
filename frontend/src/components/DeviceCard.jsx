import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

function areEqual(prevProps, nextProps) {
  return JSON.stringify(prevProps.device) === JSON.stringify(nextProps.device);
}

const DeviceCardComponent = ({ device }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getHeaderColor = (device) => {
    if (!device?.Connected) return "bg-[#D20C2D]"; // Default color

    const status = device.Connected.toLowerCase();

    if (status === "yes") return "bg-[#19CD40]";
    if (status === "fc") return "bg-[#DD9804]";
    return "bg-[#D20C2D]";
  };

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("en-GB", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   });
  // };
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return "Invalid date";

    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1; // JS months are 0-indexed
    const day = parseInt(dateString.slice(6, 8), 10);

    const date = new Date(year, month, day);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden min-w-[300px] cursor-pointer transition hover:shadow-lg">
      <div
        className={`${getHeaderColor(
          device
        )} text-white p-3 flex justify-between items-center`}
        onClick={toggleExpand}
      >
        <div className="font-semibold text-sm">
          Device Id : {device.Deviceid}
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-white" />
        ) : (
          <ChevronDown size={18} className="text-white" />
        )}
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">_id :</span>
            <span className="font-medium">{device._id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Date :</span>
            <span className="font-medium">{formatDate(device.Date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Time :</span>
            <span className="font-medium">{device.Time}</span>
          </div>

          {device.Operator1 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Operator 1 :</span>
              <StatusBadge status={device.Operator1} />
            </div>
          )}

          {device.Operator2 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Operator 2 :</span>
              <StatusBadge status={device.Operator2} />
            </div>
          )}

          {device.Mat1 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">MAT 1 :</span>
              <StatusBadge status={device.Mat1} />
            </div>
          )}

          {device.Mat2 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">MAT 2 :</span>
              <StatusBadge status={device.Mat2} />
            </div>
          )}
          {device.Machine && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Machine :</span>
              <StatusBadge status={device.Machine} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export const DeviceCard = React.memo(DeviceCardComponent, areEqual);
