import { Navigate, RouteObject } from 'react-router-dom';
import StaffLayout from '@/layouts/StaffLayout';
import PortalLayout from '@/layouts/PortalLayout';
import PublicLayout from '@/layouts/PublicLayout';
import RequireAuth from '@/shared/auth/RequireAuth';
import DashboardPage from '@/features/dashboard/DashboardPage';
import PatientsPage from '@/features/patients/PatientsPage';
import PatientDetailPage from '@/features/patients/PatientDetailPage';
import AppointmentsPage from '@/features/appointments/AppointmentsPage';
import VisitsPage from '@/features/visits/VisitsPage';
import VisitDetailPage from '@/features/visits/VisitDetailPage';
import PrescriptionsPage from '@/features/prescriptions/PrescriptionsPage';
import FilesPage from '@/features/files/FilesPage';
import FollowUpsPage from '@/features/followups/FollowUpsPage';
import BillingPage from '@/features/billing/BillingPage';
import SettingsPage from '@/features/settings/SettingsPage';
import TeamPage from '@/features/team/TeamPage';
import RolesPage from '@/features/roles/RolesPage';
import AuditLogPage from '@/features/audit/AuditLogPage';
import PregnanciesPage from '@/features/obgyn/PregnanciesPage';
import PregnancyDetailPage from '@/features/obgyn/PregnancyDetailPage';
import PediatricsPage from '@/features/pediatrics/PediatricsPage';
import DentalPage from '@/features/dental/DentalPage';
import DermatologyPage from '@/features/dermatology/DermatologyPage';
import GeneralCarePage from '@/features/general/GeneralCarePage';
import ClinicalSpecialtyPage from '@/features/clinical/ClinicalSpecialtyPage';
import { SPECIALTY_CATALOG, routePathFor } from '@/shared/config/specialtyCatalog';
import { ROUTE_PERMISSIONS, specialtyPermission } from '@/shared/config/navPermissions';
import NotificationsPage from '@/features/notifications/NotificationsPage';
import PortalHomePage from '@/features/portal/PortalHomePage';
import PortalAppointmentsPage from '@/features/portal/PortalAppointmentsPage';
import PortalPrescriptionsPage from '@/features/portal/PortalPrescriptionsPage';
import PortalFilesPage from '@/features/portal/PortalFilesPage';
import PortalFollowUpsPage from '@/features/portal/PortalFollowUpsPage';
import PortalTimelinePage from '@/features/portal/PortalTimelinePage';
import PortalProfilePage from '@/features/portal/PortalProfilePage';
import PortalNotificationsPage from '@/features/portal/PortalNotificationsPage';
import PublicClinicPage from '@/features/public/PublicClinicPage';
import BookAppointmentPage from '@/features/public/BookAppointmentPage';
import HomePage from '@/features/home/HomePage';
import AuthPage from '@/features/auth/AuthPage';
import OnboardingPage from '@/features/onboarding/OnboardingPage';

const staff = (element: JSX.Element, permission?: string | string[]) => (
  <RequireAuth userType="staff" permission={permission}>{element}</RequireAuth>
);

const patient = (element: JSX.Element) => (
  <RequireAuth userType="patient">{element}</RequireAuth>
);

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/auth', element: <AuthPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  {
    path: '/dashboard',
    element: <RequireAuth userType="staff"><StaffLayout /></RequireAuth>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'patients', element: staff(<PatientsPage />, ROUTE_PERMISSIONS.patients) },
      { path: 'patients/:id', element: staff(<PatientDetailPage />, ROUTE_PERMISSIONS.patients) },
      { path: 'appointments', element: staff(<AppointmentsPage />, ROUTE_PERMISSIONS.appointments) },
      { path: 'visits', element: staff(<VisitsPage />, ROUTE_PERMISSIONS.visits) },
      { path: 'visits/:id', element: staff(<VisitDetailPage />, ROUTE_PERMISSIONS.visits) },
      { path: 'prescriptions', element: staff(<PrescriptionsPage />, ROUTE_PERMISSIONS.prescriptions) },
      { path: 'files', element: staff(<FilesPage />, ROUTE_PERMISSIONS.files) },
      { path: 'followups', element: staff(<FollowUpsPage />, ROUTE_PERMISSIONS.followups) },
      { path: 'billing', element: staff(<BillingPage />, ROUTE_PERMISSIONS.billing) },
      { path: 'settings', element: staff(<SettingsPage />, ROUTE_PERMISSIONS.settings) },
      { path: 'team', element: staff(<TeamPage />, ROUTE_PERMISSIONS.team) },
      { path: 'roles', element: staff(<RolesPage />, ROUTE_PERMISSIONS.roles) },
      { path: 'audit', element: staff(<AuditLogPage />, ROUTE_PERMISSIONS.audit) },
      { path: 'obgyn', element: staff(<PregnanciesPage />, specialtyPermission('obgyn')) },
      { path: 'obgyn/:id', element: staff(<PregnancyDetailPage />, specialtyPermission('obgyn')) },
      { path: 'pediatrics', element: staff(<PediatricsPage />, specialtyPermission('pediatrics')) },
      { path: 'dental', element: staff(<DentalPage />, specialtyPermission('dental')) },
      { path: 'dermatology', element: staff(<DermatologyPage />, specialtyPermission('dermatology')) },
      { path: 'general-care', element: staff(<GeneralCarePage />, specialtyPermission('general')) },
      ...SPECIALTY_CATALOG.filter((s) => s.workspace === 'clinical').map((s) => ({
        path: routePathFor(s.code),
        element: staff(<ClinicalSpecialtyPage code={s.code} />, specialtyPermission(s.code)),
      })),
      { path: 'notifications', element: <NotificationsPage /> },
    ],
  },
  {
    path: '/portal',
    element: <RequireAuth userType="patient"><PortalLayout /></RequireAuth>,
    children: [
      { index: true, element: <PortalHomePage /> },
      { path: 'appointments', element: patient(<PortalAppointmentsPage />) },
      { path: 'prescriptions', element: patient(<PortalPrescriptionsPage />) },
      { path: 'files', element: patient(<PortalFilesPage />) },
      { path: 'followups', element: patient(<PortalFollowUpsPage />) },
      { path: 'timeline', element: patient(<PortalTimelinePage />) },
      { path: 'profile', element: patient(<PortalProfilePage />) },
      { path: 'notifications', element: patient(<PortalNotificationsPage />) },
    ],
  },
  {
    path: '/:clinicSlug',
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicClinicPage /> },
      { path: 'book', element: <BookAppointmentPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
