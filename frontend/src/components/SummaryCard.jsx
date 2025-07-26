import { MdOutlineDevices } from "react-icons/md"; // You can swap icon

export const SummaryCard = ({
  count,
  label,
  bgColor = "bg-white",
  textColor = "text-black",
}) => {
  return (
    <div
      className={`relative flex justify-between items-start ${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-md w-48 border-l-4 border-blue-700`}
    >
      {/* Left content */}
      <div className="flex flex-col justify-between h-full">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-lg font-bold text-blue-800">{count} Device</div>
      </div>

      {/* Icon box on top right */}
      <div className="bg-blue-100 p-2 rounded-md">
        <MdOutlineDevices className="text-blue-700 text-xl" />
      </div>
    </div>
  );
};
