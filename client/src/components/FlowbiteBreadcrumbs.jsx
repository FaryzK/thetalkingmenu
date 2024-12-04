import React from "react";
import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { useParams, Link } from "react-router-dom";

const FlowbiteBreadcrumbs = () => {
  const { dashboardId, restaurantId } = useParams();

  const paths = [
    { label: "Dashboards", url: "/dashboards" },
    dashboardId && {
      label: `Dashboard`,
      url: `/dashboards/${dashboardId}`,
    },
    restaurantId && {
      label: `Restaurant`,
      url: `/dashboards/${dashboardId}/restaurant/${restaurantId}`,
    },
  ].filter(Boolean); // Remove falsy entries

  return (
    <Breadcrumb aria-label="Breadcrumb">
      {paths.map((path, index) => (
        <BreadcrumbItem key={index}>
          {path.url ? (
            <Link to={path.url} className="hover:underline">
              {path.label}
            </Link>
          ) : (
            path.label
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default FlowbiteBreadcrumbs;
