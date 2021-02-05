import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavigationStart, Router } from '@angular/router';
import { AutocloseOverlaysService } from './shared/services/autoclose-overlays.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private autocloseOverlaysService: AutocloseOverlaysService
  ) {
    this.initializeApp();
    this.router.events.subscribe((event: any): void => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === 'popstate') {
          this.autocloseOverlaysService.trigger();
        }
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
