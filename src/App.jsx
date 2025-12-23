import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Shopping from './pages/Shopping';
import Pantry from './pages/Pantry';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/home" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/planner" element={<Layout currentPageName="Planner"><Planner /></Layout>} />
          <Route path="/shopping" element={<Layout currentPageName="Shopping"><Shopping /></Layout>} />
          <Route path="/pantry" element={<Layout currentPageName="Pantry"><Pantry /></Layout>} />
          <Route path="/analytics" element={<Layout currentPageName="Analytics"><Analytics /></Layout>} />
          <Route path="/settings" element={<Layout currentPageName="Settings"><Settings /></Layout>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
