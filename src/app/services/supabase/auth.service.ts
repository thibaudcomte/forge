import { Service, signal } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { supabase } from './client';

@Service()
export class AuthService {
  session = signal<Session | null>(null);
  user = signal<User | null>(null);

  constructor() {
    // hydrate on load
    supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);
    });

    // react to changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });
  }

  signIn() {
    return supabase.auth.signInWithPassword({
      email: environment.user.email,
      password: environment.user.password,
    });
  }
}
