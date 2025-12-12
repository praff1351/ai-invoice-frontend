import { Loader } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = ({children}) => {
  const {isAuthenticated,loading } = useAuth();

  // console.log("🔐 ProtectedRoute - State:", { loading, isAuthenticated }); //

  
  

  if(loading){
    return(
      <Loader className="animate-spin h-8 w-8 text-blue-900" />
    )
  }

  if(!isAuthenticated){
    // console.log(" Not authenticated, redirecting to login"); //
    return <Navigate to="/login" replace />
  }

  // console.log(" User authenticated, rendering content"); //


  return (
    <DashboardLayout>
      {children ? children : <Outlet />}
    </DashboardLayout>
  )
}

export default ProtectedRoute;