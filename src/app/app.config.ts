import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, RouteReuseStrategy, withComponentInputBinding } from '@angular/router';

import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { AuthService } from './services/supabase/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withComponentInputBinding()),
    provideAppInitializer(() => inject(AuthService).signIn()),
  ],
};
