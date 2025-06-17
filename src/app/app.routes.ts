import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './auth/guards/auth.guard';
import { authNoAccessGuard } from './auth/guards/auth-no-access.guard';
import { userAuthGuardGuard } from './auth/guards/user-auth-guard.guard';
import { adminAuthGuardGuard } from './auth/guards/admin-auth-guard.guard';



export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authNoAccessGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [authNoAccessGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { path: 'user', 
    loadComponent: () => 
      import('./Pages/user/user/user.component').then(m => m.UserComponent),
    canActivate: [authGuard, adminAuthGuardGuard]
  },
  { path: 'category', 
    loadComponent: () => 
      import('./Pages/category/category/category.component').then(m => m.CategoryComponent), 
    canActivate: [authGuard, adminAuthGuardGuard]
  },
  { path: 'preference', 
    loadComponent: () => 
      import('./Pages/preference/preference/preference.component').then(m => m.PreferencesComponent), 
    canActivate: [authGuard, userAuthGuardGuard]
  },
  { path: 'calendar', 
    loadComponent: () => 
      import('./Pages/calendar/week-calendar/week-calendar.component').then(m => m.WeekCalendarComponent), 
    canActivate: [authGuard]
  },
  { path: 'add-category', 
    loadComponent: () => 
      import('./Pages/category/add-category/add-category.component').then(m => m.AddEditCategoryComponent), 
    canActivate: [authGuard, adminAuthGuardGuard]
  },
  { path: 'add-category/:id', 
    loadComponent: () => 
    import('./Pages/category/add-category/add-category.component').then(m => m.AddEditCategoryComponent),
    canActivate: [authGuard, adminAuthGuardGuard]
   },
];