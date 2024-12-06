import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchRestaurant,
  clearRestaurantState,
} from "../redux/slices/restaurantSlice";
import { fetchChatBot, clearChatBotState } from "../redux/slices/chatBotSlice";
import {
  fetchRestaurantChats,
  clearRestaurantChatsState,
} from "../redux/slices/restaurantChatsSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchRestaurantAnalytics,
  clearRestaurantAnalyticsState,
} from "../redux/slices/restaurantAnalyticsSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  FiSettings,
  FiMessageCircle,
  FiBarChart,
  FiMail,
  FiShare2,
  FiInfo,
  FiEdit,
  FiList,
  FiHelpCircle,
  FiUsers,
} from "react-icons/fi";
import FlowbiteBreadcrumbs from "../components/FlowbiteBreadcrumbs";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController
);

export default function Restaurant() {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selectors for restaurant, chatBot, and chats data from Redux store
  const {
    data: restaurant,
    status: restaurantStatus,
    error: restaurantError,
  } = useSelector((state) => state.restaurant);
  const {
    data: chatBot,
    status: chatBotStatus,
    error: chatBotError,
  } = useSelector((state) => state.chatBot);
  const {
    allChats: restaurantChats,
    status: chatsStatus,
    error: chatsError,
  } = useSelector((state) => state.restaurantChats);
  const {
    data: analytics,
    status: analyticsStatus,
    error: analyticsError,
  } = useSelector((state) => state.restaurantAnalytics);

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchRestaurant({ token, restaurantId }));
      dispatch(fetchChatBot({ token, restaurantId }));
      dispatch(fetchRestaurantChats({ token, restaurantId }));
      dispatch(fetchRestaurantAnalytics({ token, restaurantId }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearRestaurantState());
        dispatch(clearChatBotState());
        dispatch(clearRestaurantChatsState());
        dispatch(clearRestaurantAnalyticsState());
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId]);

  const totalChats = analytics?.totalChats ?? 0;
  const totalMessages = analytics?.totalMessages ?? 0;
  const monthlyStats = analytics?.monthlyStats ?? [];

  const reversedMonthlyStats = [...monthlyStats].reverse(); // Reverse the order to go from oldest to newest
  const chatsChartData = {
    labels:
      reversedMonthlyStats.length > 0
        ? reversedMonthlyStats.map((stat) => `${stat.month}/${stat.year}`)
        : ["No Data"],
    datasets: [
      {
        label: "Total Chats",
        data:
          reversedMonthlyStats.length > 0
            ? reversedMonthlyStats.map((stat) => stat.chats)
            : [0],
        borderColor: "rgba(75, 192, 192, 1)", // Light green line
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Light green fill
        tension: 0.4, // Smooth curve
        fill: true,
      },
    ],
  };

  const messagesChartData = {
    labels:
      reversedMonthlyStats.length > 0
        ? reversedMonthlyStats.map((stat) => `${stat.month}/${stat.year}`)
        : ["No Data"],
    datasets: [
      {
        label: "Total Messages",
        data:
          reversedMonthlyStats.length > 0
            ? reversedMonthlyStats.map((stat) => stat.messages)
            : [0],
        borderColor: "rgba(54, 162, 235, 1)", // Light blue line
        backgroundColor: "rgba(54, 162, 235, 0.2)", // Light blue fill
        tension: 0.4, // Smooth curve
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const { datasetIndex, raw } = tooltipItem;
            const label = datasetIndex === 0 ? "Chats" : "Messages";
            return `${label}: ${raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month/Year",
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "",
          font: {
            size: 14,
          },
        },
        ticks: {
          stepSize: 1, // Adjust based on your data range
        },
      },
    },
  };

  return (
    <div className="bg-gray-100 p-6">
      <FlowbiteBreadcrumbs />
      {/* Restaurant Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{restaurant?.name}</h1>
        <p className="text-gray-500">{restaurant?.location}</p>
      </div>

      {/* Combined Analytics Overview */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiBarChart className="mr-2" /> Analytics Overview
        </h2>

        <div className="mt-4 space-y-6">
          {/* Header for "This Month" */}
          <div>
            <h3 className="text-md font-bold text-gray-700 mb-2">This Month</h3>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Chats</h4>
                  <p className="text-xl font-bold text-gray-800">
                    {monthlyStats[0]?.chats || 0}
                  </p>
                  <p
                    className={`text-sm flex items-center ${
                      monthlyStats[1]
                        ? monthlyStats[0]?.chats > monthlyStats[1]?.chats
                          ? "text-green-500"
                          : monthlyStats[0]?.chats < monthlyStats[1]?.chats
                          ? "text-red-500"
                          : "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    {monthlyStats[1] ? (
                      <>
                        {monthlyStats[0]?.chats - monthlyStats[1]?.chats > 0 ? (
                          <span className="mr-1">▲</span>
                        ) : monthlyStats[0]?.chats - monthlyStats[1]?.chats <
                          0 ? (
                          <span className="mr-1">▼</span>
                        ) : (
                          <span className="mr-1">•</span>
                        )}
                        {`${Math.abs(
                          monthlyStats[0]?.chats - monthlyStats[1]?.chats
                        )} chats since last month`}
                      </>
                    ) : (
                      "No data for last month"
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Messages
                  </h4>
                  <p className="text-xl font-bold text-gray-800">
                    {monthlyStats[0]?.messages || 0}
                  </p>
                  <p
                    className={`text-sm flex items-center ${
                      monthlyStats[1]
                        ? monthlyStats[0]?.messages > monthlyStats[1]?.messages
                          ? "text-green-500"
                          : monthlyStats[0]?.messages <
                            monthlyStats[1]?.messages
                          ? "text-red-500"
                          : "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    {monthlyStats[1] ? (
                      <>
                        {monthlyStats[0]?.messages - monthlyStats[1]?.messages >
                        0 ? (
                          <span className="mr-1">▲</span>
                        ) : monthlyStats[0]?.messages -
                            monthlyStats[1]?.messages <
                          0 ? (
                          <span className="mr-1">▼</span>
                        ) : (
                          <span className="mr-1">•</span>
                        )}
                        {`${Math.abs(
                          monthlyStats[0]?.messages - monthlyStats[1]?.messages
                        )} messages since last month`}
                      </>
                    ) : (
                      "No data for last month"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Header for "Total" */}
          <div>
            <h3 className="text-md font-bold text-gray-700 mb-2">Total</h3>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Chats</h4>
                  <p className="text-xl font-bold text-gray-800">
                    {totalChats}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Messages
                  </h4>
                  <p className="text-xl font-bold text-gray-800">
                    {totalMessages}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Improved Configure Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiSettings className="mr-2" /> Configure
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {[
            {
              label: "Share AI Chat",
              route: "qrcode",
              icon: <FiShare2 className="text-blue-500" />,
            },
            {
              label: "Restaurant Info",
              route: "info",
              icon: <FiInfo className="text-green-500" />,
            },
            {
              label: "Update Prompt",
              route: "system-prompt",
              icon: <FiEdit className="text-purple-500" />,
            },
            {
              label: "Update Menu",
              route: "menu",
              icon: <FiList className="text-yellow-500" />,
            },
            {
              label: "Update Suggested Questions",
              route: "suggested-questions",
              icon: <FiHelpCircle className="text-red-500" />,
            },
            {
              label: "Manage Employees",
              route: "employee-access",
              icon: <FiUsers className="text-indigo-500" />,
            },
          ].map(({ label, route, icon }) => (
            <button
              key={route}
              onClick={() =>
                navigate(
                  `/dashboards/${dashboardId}/restaurant/${restaurantId}/${route}`
                )
              }
              className="p-4 rounded-lg shadow-md flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <span className="text-sm font-semibold text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Performance Graph */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FiBarChart className="mr-2" /> Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Chats Graph */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md border">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              Total Chats Over Time
            </h3>
            <div className="h-64">
              {monthlyStats.length > 0 ? (
                <Line data={chatsChartData} options={chartOptions} />
              ) : (
                <p className="text-gray-500">
                  No chats data available to display.
                </p>
              )}
            </div>
          </div>

          {/* Messages Graph */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md border">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              Total Messages Over Time
            </h3>
            <div className="h-64">
              {monthlyStats.length > 0 ? (
                <Line data={messagesChartData} options={chartOptions} />
              ) : (
                <p className="text-gray-500">
                  No messages data available to display.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Chats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiMessageCircle className="mr-2" /> Latest Chats
          </h2>
          <button
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/chats`
              )
            }
            className="text-blue-500 underline hover:text-blue-600"
          >
            See All
          </button>
        </div>
        <div className="space-y-3">
          {restaurantChats?.map((chat) => (
            <button
              key={chat._id}
              onClick={() =>
                window.open(
                  `/restaurant/${restaurantId}/chat/${chat.tableNumber}/${chat._id}`,
                  "_blank"
                )
              }
              className="w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition flex justify-between items-center text-left"
            >
              <p className="text-gray-800 truncate flex-1 pr-4">
                {chat.firstMessage}
              </p>
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {new Date(chat.timestamp).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
