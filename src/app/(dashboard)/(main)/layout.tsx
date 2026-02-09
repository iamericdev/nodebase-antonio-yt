import { AppHeader } from "@/components/app-header";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AppHeader />
      <div className="flex-1">{children}</div>
    </>
  );
};

export default MainLayout;
