import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { PhotographerPortfolio } from "@/components/PhotographerPortfolio";
import { PhotographerDashboard } from "@/components/PhotographerDashboard";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/photographer/:id" 
          element={<PhotographerPortfolio photographerId="f47ac10b-58cc-4372-a567-0e02b2c3d479" />} 
        />
        <Route 
          path="/photographer/:id/manage" 
          element={<PhotographerDashboard photographerId="f47ac10b-58cc-4372-a567-0e02b2c3d479" />} 
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;