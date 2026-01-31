import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

const SidebarMenu = ({ onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button
        icon="pi pi-bars"
        label="Menu"
        className="p-button-outlined p-button-sm"
        onClick={() => setVisible(true)}
      />

      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="p-sidebar-sm"
      >
        <div className="flex flex-column gap-3">
          <h2 className="text-xl font-bold mb-4">Menu</h2>

          <button
            onClick={() => {
              onSelect("home");
              setVisible(false);
            }}
            className="flex align-items-center gap-2 text-secondary hover:text-primary"
          >
            <i className="pi pi-home"></i> Home
          </button>

          <button
            onClick={() => {
              onSelect("about");
              setVisible(false);
            }}
            className="flex align-items-center gap-2 text-secondary hover:text-primary"
          >
            <i className="pi pi-info-circle"></i> About
          </button>

          <button
            onClick={() => {
              onSelect("services");
              setVisible(false);
            }}
            className="flex align-items-center gap-2 text-secondary hover:text-primary"
          >
            <i className="pi pi-briefcase"></i> Services
          </button>

          <button
            onClick={() => {
              onSelect("contact");
              setVisible(false);
            }}
            className="flex align-items-center gap-2 text-secondary hover:text-primary"
          >
            <i className="pi pi-envelope"></i> Contact
          </button>
        </div>
      </Sidebar>
    </div>
  );
};

export default SidebarMenu;
