
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
            element={<PhotographerDashboard photographerId="f47ac10b-58cc-4372-a567-0e02b2c3d479" />} 
          />
          <Route path="/category/:category" element={<CategoryPage />} />
        </Routes>
        <Toaster />
      </Layout>
    </Router>
  );
}

export default App;
