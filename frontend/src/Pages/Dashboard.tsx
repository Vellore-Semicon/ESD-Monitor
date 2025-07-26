import { ChevronDown } from "lucide-react";
import { SummaryCard } from "../components/SummaryCard";
import { DeviceCard } from "../components/DeviceCard";
import { useCallback, useEffect, useState } from "react";
import api from "../utils/api";
import SideNavBar from "../components/SideNavBar/SideNavBar";

// TypeScript types
type DeviceData = {
  _id: string;
  DeviceID: string;
  Connected: string;
  Date: string;
  Time: string;
  Operator1: string;
  Operator2: string;
  Mat1: string;
  Mat2: string;
  Machine: string;
};

const plantData = [
  {
    plantName: "Plant-1",
    devices: [
      /* array of devices */
    ],
  },
  {
    plantName: "Plant-2",
    devices: [
      /* array of devices */
    ],
  },
];

type ApiResponse = {
  success: boolean;
  data: DeviceData[];
};

export const Dashboard = () => {
  const [data, setData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const response = await api.get<ApiResponse>("/api/data");
      const { data: responseData } = response;
      console.log("API Response:", responseData);
      if (!responseData.success) {
        throw new Error("API request was not successful");
      }

      if (Array.isArray(responseData.data)) {
        // Only set data if it's changed
        const newDataStr = JSON.stringify(responseData.data);
        const oldDataStr = JSON.stringify(data);

        if (newDataStr !== oldDataStr) {
          setData(responseData.data);
          setLastUpdated(new Date().toLocaleTimeString("en-IN"));
        }
      } else {
        setData([]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 2000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const totalDevices = data.length;
  const connectedDevices = data.filter(
    (d) => d.Connected?.toLowerCase() === "yes"
  ).length;
  const failedDevices = data.filter(
    (d) => d.Connected?.toLowerCase() === "fc"
  ).length;
  const notConnectedDevices = data.filter(
    (d) => d.Connected?.toLowerCase() === "no"
  ).length;

  return (
    <div className="flex">
      {/* Side Navigation Bar */}
      {/* <div className="hidden md:block w-full md:w-1/5 bg-white border-r">
        <SideNavBar />
      </div> */}
      <div className="flex-1 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#ffffff] text-black p-4 md:p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-lg md:text-xl font-semibold">
              ESD Continuous Monitoring Dashboard
            </h1>
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 space-y-6 bg-[#E4E1E1] min-h-screen ">
          {/* Summary Cards */}
          <div className="flex flex-wrap gap-3 md:gap-4 max-w-7xl justify-center items-center mx-auto">
            <SummaryCard
              count={totalDevices}
              label="Total"
              //bgColor="bg-[#4019CD1A]"
              textColor="text-[#4019CD]"
            />
            <SummaryCard
              count={connectedDevices}
              label="Connected"
              //bgColor="bg-[#19CD401A]"
              textColor="text-[#19CD40]"
            />
            <SummaryCard
              count={notConnectedDevices}
              label="Not Connected"
              //bgColor="bg-[#D20C2D1A]"
              textColor="text-[#D20C2D]"
            />
            <SummaryCard
              count={failedDevices}
              label="Failed Connected"
              //bgColor="bg-[#ECA2031A]"
              textColor="text-[#ECA203]"
            />
          </div>

          {/* Production Line Overview */}
          <div className="space-y-6">
            {plantData.map((plant, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-lg shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                    {plant.plantName}
                  </h2>
                </div>

                {error && (
                  <p className="text-center text-sm text-red-500">{error}</p>
                )}

                {!loading && plant.devices.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    No device data available.
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                  {data.map((deviceData, index) => (
                    <DeviceCard
                      key={deviceData._id}
                      device={{
                        _id: deviceData._id,
                        Deviceid: deviceData.DeviceID,
                        Connected: deviceData.Connected,
                        Date: deviceData.Date,
                        Time: deviceData.Time,
                        Operator1: deviceData.Operator1,
                        Operator2: deviceData.Operator2,
                        Mat1: deviceData.Mat1,
                        Mat2: deviceData.Mat2,
                        Machine: deviceData.Machine,
                      }}
                    />
                  ))}
                </div>
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                  {plant.devices.map((deviceData, index) => (
                    <DeviceCard
                      key={deviceData.DeviceID || index}
                      device={{
                        Deviceid: deviceData.DeviceID,
                        Connected: deviceData.Connected,
                        Date: deviceData.Date,
                        Time: deviceData.Time,
                        Operator1: deviceData.Operator1,
                        Operator2: deviceData.Operator2,
                        Mat1: deviceData.Mat1,
                        Mat2: deviceData.Mat2,
                        Machine: deviceData.Machine,
                      }}
                    />
                  ))}
                </div> */}
              </div>
            ))}
          </div>

          {/* <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 max-w-7xl mx-auto">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Plant-1
              </h2>
            </div>

            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}
            {!loading && data.length === 0 && (
              <p className="text-center text-sm text-gray-500">
                No device data available.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
              {data.map((deviceData, index) => (
                <DeviceCard
                  key={deviceData.DeviceID || index}
                  device={{
                    Deviceid: deviceData.DeviceID,
                    Connected: deviceData.Connected,
                    Date: deviceData.Date,
                    Time: deviceData.Time,
                    Operator1: deviceData.Operator1,
                    Operator2: deviceData.Operator2,
                    Mat1: deviceData.Mat1,
                    Mat2: deviceData.Mat2,
                    Machine: deviceData.Machine,
                  }}
                />
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
