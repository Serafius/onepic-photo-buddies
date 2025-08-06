
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { SignUp } from "@/pages/SignUp";
import { PhotographerPortfolio } from "@/components/PhotographerPortfolio";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { CategoryPage } from "@/pages/CategoryPage";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { AllPhotographers } from "@/pages/photographers";
import { FeaturedPhotographers } from "@/pages/featured";
import { ClientSessions } from "@/pages/ClientSessions";
import { PhotographerBookings } from "@/pages/PhotographerBookings";
import { ManagePortfolio } from "@/pages/ManagePortfolio";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/photographers" element={<AllPhotographers />} />
          <Route path="/featured" element={<FeaturedPhotographers />} />
          <Route 
            path="/photographer/:id" 
            element={<PhotographerPortfolio />} 
          />
          <Route 
            path="/photographer/:id/manage" 
            element={<PhotographerDashboard />} 
          />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/client/sessions" element={<ClientSessions />} />
          <Route path="/photographer/bookings" element={<PhotographerBookings />} />
          <Route path="/photographer/:id/portfolio" element={<ManagePortfolio />} />
        </Routes>
        <Toaster />
      </Layout>
    </Router>
  );
}

export default App;
