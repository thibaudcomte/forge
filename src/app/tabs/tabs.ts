import { Component, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleSharp, analyticsSharp, appsSharp, barbellSharp } from 'ionicons/icons';
import { LogState } from '../state/log-state';

@Component({
  selector: 'tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './tabs.html',
})
export class Tabs {
  readonly state = inject(LogState);

  constructor() {
    addIcons({ appsSharp, barbellSharp, addCircleSharp, analyticsSharp });
  }
}
