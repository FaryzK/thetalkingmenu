import { Link, useLocation } from "react-router-dom";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import React from "react";
import thetalkingmenulogo from "../assets/thetalkingmenulogo.png";

export default function Header() {
  const path = useLocation().pathname;
  return (
    <Navbar className="bg-gray-900" fluid>
      <Navbar.Brand href="/">
        <img
          src={thetalkingmenulogo}
          className="mr-3 h-6 sm:h-9"
          alt="The Talking Menu Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-400">
          The Talking Menu
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        {false ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img="https://cdn-icons-png.flaticon.com/512/17492/17492071.png"
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">Bonnie Green</span>
              <span className="block truncate text-sm font-medium">
                name@flowbite.com
              </span>
            </Dropdown.Header>
            <Dropdown.Item>Dashboard</Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Item>Earnings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue">Sign in</Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/" active={path === "/"}>
          Home
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
