import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { PlantProvider } from './context/PlantContext';
import { TaskProvider } from './context/TaskContext';
import { HealthProvider } from './context/HealthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ReportProvider } from './context/ReportContext';
import { GrowthProvider } from './context/GrowthContext';
import ReportViewer from './pages/reports/ReportViewer';

// Pages
import Dashboard from './pages/Dashboard';
import MyPlants from './pages/plants/MyPlants';
import AddPlant from './pages/plants/AddPlant';
import PlantDetails from './pages/plants/PlantDetails';
import EditPlant from './pages/plants/EditPlant';
import CareTasks from './pages/care/CareTasks';
import CareCalendar from './pages/care/CareCalendar';
import PlantLibrary from './pages/library/PlantLibrary';
import PlantLibraryDetails from './pages/library/PlantLibraryDetails';
import GrowthJournal from './pages/growth/GrowthJournal';
import AddGrowthEntry from './pages/growth/AddGrowthEntry';
import PlantHealth from './pages/health/PlantHealth';
import AddHealthRecord from './pages/health/AddHealthRecord';
import Analytics from './pages/analytics/Analytics';
import Settings from './pages/settings/Settings';
import PlantReport from './pages/plants/PlantReport';
import MyReports from './pages/reports/MyReports'; // <-- ADDED
import NotFound from './components/common/NotFound';

function App() {
  return (
    <PlantProvider>
      <TaskProvider>
        <GrowthProvider>
          <HealthProvider>
            <SettingsProvider>
              <ReportProvider>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    
                    <Route path="plants" element={<MyPlants />} />
                    <Route path="plants/add" element={<AddPlant />} />
                    <Route path="plants/:id" element={<PlantDetails />} />
                    <Route path="plants/:id/edit" element={<EditPlant />} />
                    <Route path="plants/:id/report" element={<PlantReport />} />
                    
                    <Route path="care/tasks" element={<CareTasks />} />
                    <Route path="care/calendar" element={<CareCalendar />} />
                    
                    <Route path="library" element={<PlantLibrary />} />
                    <Route path="library/:id" element={<PlantLibraryDetails />} />
                    
                    <Route path="growth" element={<GrowthJournal />} />
                    <Route path="growth/add" element={<AddGrowthEntry />} />
                    
                    <Route path="health" element={<PlantHealth />} />
                    <Route path="health/add" element={<AddHealthRecord />} />
                    
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    
                    <Route path="reports" element={<MyReports />} /> 
                    <Route path="reports/:id" element={<ReportViewer />} /> {/* <-- ADD THIS */}{/* <-- ADDED */}
                    
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </ReportProvider>
            </SettingsProvider>
          </HealthProvider>
        </GrowthProvider>
      </TaskProvider>
    </PlantProvider>
  );
}

export default App;