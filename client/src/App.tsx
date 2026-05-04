import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OrderForm from "./pages/OrderForm";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Lazy load admin pages for better performance
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const ViewOrder = lazy(() => import("./pages/ViewOrder"));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#B87333]" />
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/services"} component={Services} />
      <Route path={"/order"} component={OrderForm} />
      <Route path={"/portfolio"} component={Portfolio} />
      <Route path={"/admin-login"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminLoginPage />
        </Suspense>
      </Route>
      <Route path={"/admin"}>
        <Suspense fallback={<LoadingSpinner />}>
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path={"/admin/services"}>
        <Suspense fallback={<LoadingSpinner />}>
          <ProtectedRoute>
            <AdminServices />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path={"/admin/orders/:id"}>
        <Suspense fallback={<LoadingSpinner />}>
          <ProtectedRoute>
            <ViewOrder />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
