import React from "react";
import { useParams } from "react-router-dom";

export default function Dashboard() {
  const { dashboardId } = useParams();

  return (
    <div>
      <h1>Dashboard {dashboardId}</h1>
      {/* Fetch and display information specific to this dashboard */}
    </div>
  );
}
