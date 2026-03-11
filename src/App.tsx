import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Progress from "./pages/Progress";
import Notifications from "./pages/Notifications";
import LessonDetail from "./pages/LessonDetail";
import CourseDetail from "./pages/CourseDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminHomework from "./pages/admin/AdminHomework";
import AdminStudentDetail from "./pages/admin/AdminStudentDetail";
import AdminStats from "./pages/admin/AdminStats";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Certificates from "./pages/Certificates";
import Messages from "./pages/Messages";
import SearchPage from "./pages/SearchPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected app routes */}
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="courses/:id" element={<CourseDetail />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="lessons" element={<Courses />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="lessons/:id" element={<LessonDetail />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="certificates" element={<Certificates />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="search" element={<SearchPage />} />
                </Route>
                
                {/* Admin routes */}
                <Route path="/admin" element={<AppLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="homework" element={<AdminHomework />} />
                  <Route path="students/:userId" element={<AdminStudentDetail />} />
                  <Route path="stats" element={<AdminStats />} />
                </Route>
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
