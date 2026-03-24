import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Dashboard } from './pages/Dashboard'
import BillingView from './pages/BillingView'
import { MenuView } from './pages/MenuView'
import { StaffView } from './pages/StaffView'
import { TableView } from './pages/TableView'
import { POSView } from './pages/POSView'
import { ReservationsView } from './pages/ReservationsView'
import { FinancialsView } from './pages/FinancialsView'
import { OrderPortal } from './pages/OrderPortal'
import AutomationView from './pages/AutomationView'
import MessagesView from './pages/MessagesView'
import SettingsView from './pages/SettingsView'
import OnboardingView from './pages/OnboardingView'
import AccountSettingsView from './pages/AccountSettingsView'
import SecuregateLogin from './pages/SecuregateLogin'
import TenantLogin from './pages/TenantLogin'
import AccessDenied from './pages/AccessDenied'
import { SaaSAdminLayout } from './layouts/SaaSAdminLayout'
import TenantManagementView from './pages/saas/TenantManagementView'
import SaaSSettingsView from './pages/saas/SaaSSettingsView'
import SaaSSubscriptionsView from './pages/saas/SaaSSubscriptionsView'
import AdminManagementView from './pages/saas/AdminManagementView'
import SaaSDashboard from './pages/saas/SaaSDashboard'
import SupportTicketsView from './pages/saas/SupportTicketsView'
import EmailManagementView from './pages/saas/EmailManagementView'
import SaaSCMSView from './pages/saas/SaaSCMSView'
import TranslationManagementView from './pages/saas/TranslationManagementView'
import PlanManagementView from './pages/saas/PlanManagementView'
import ComingSoonView from './pages/ComingSoonView'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { PublicLayout } from './layouts/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import PricingPage from './pages/public/PricingPage'
import FeaturesPage from './pages/public/FeaturesPage'
import BlogPage from './pages/public/BlogPage'
import CustomerStoriesPage from './pages/public/CustomerStoriesPage'
import DocumentationPage from './pages/public/DocumentationPage'
import HelpCenterPage from './pages/public/HelpCenterPage'
import AboutUsPage from './pages/public/AboutUsPage'
import CommunityPage from './pages/public/CommunityPage'
import BlogDetailPage from './pages/public/BlogDetailPage'
import CustomerStoryDetailPage from './pages/public/CustomerStoryDetailPage'
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/public/NotFound'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/customers" element={<CustomerStoriesPage />} />
              <Route path="/customers/:slug" element={<CustomerStoryDetailPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
            </Route>
            
            {/* Tenant Login / Register */}
            <Route path="/login" element={<TenantLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* SaaS Super Admin (Central Domain) */}
            <Route path="/securegate" element={<SecuregateLogin />} />
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} redirectPath="/securegate" />}>
              <Route path="/securegate/*" element={<SaaSAdminLayout />}>
                <Route path="dashboard" element={<SaaSDashboard />} />
                <Route path="tenants" element={<TenantManagementView />} />
                <Route path="subscriptions" element={<SaaSSubscriptionsView />} />
                <Route path="plans" element={<PlanManagementView />} />
                <Route path="tickets" element={<SupportTicketsView />} />
                <Route path="email-templates" element={<EmailManagementView />} />
                <Route path="admins" element={<AdminManagementView />} />
                <Route path="cms" element={<SaaSCMSView />} />
                <Route path="translations" element={<TranslationManagementView />} />
                <Route path="settings" element={<SaaSSettingsView />} />
                <Route path="account" element={<AccountSettingsView />} />
              </Route>
            </Route>

            {/* Public Customer View */}
            <Route path="/order" element={<OrderPortal />} />

            {/* Admin/Business Dashboard */}
            <Route element={<ProtectedRoute redirectPath="/login" />}>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="billing" element={<BillingView />} />
                  <Route path="menu" element={<MenuView />} />
                <Route path="tables" element={<TableView />} />
                <Route path="pos" element={<POSView />} />
                <Route path="reservations" element={<ReservationsView />} />
                
                {/* Owner-Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['owner']} redirectPath="/access-denied" />}>
                  <Route path="staff" element={<StaffView />} />
                  <Route path="financials" element={<FinancialsView />} />
                  <Route path="automation" element={<AutomationView />} />
                  <Route path="messages" element={<MessagesView />} />
                   <Route path="settings" element={<SettingsView />} />
                   <Route path="onboarding" element={<OnboardingView />} />
                   <Route path="account" element={<AccountSettingsView />} />
                   <Route path="inventory" element={<ComingSoonView title="Inventory Management" description="Track stock levels, ingredient usage, and supplier orders in real-time." />} />
                   <Route path="online-ordering" element={<ComingSoonView title="Online Ordering" description="Launch your own branded web shop for pickups and deliveries." />} />
                 </Route>
              </Route>
              <Route path="/access-denied" element={<AccessDenied />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}


export default App
