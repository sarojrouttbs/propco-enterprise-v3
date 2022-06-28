import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { WorkspaceService } from 'src/app/agent/workspace/workspace.service';
import { DEFAULTS, DEFAULT_MESSAGES, ERROR_MESSAGE } from '../../constants';
import { SimpleModalPage } from '../../modals/simple-modal/simple-modal.page';
import { CommonService } from '../../services/common.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-agent-header',
  templateUrl: './agent-header.component.html',
  styleUrls: ['./agent-header.component.scss'],
})
export class AgentHeaderComponent implements OnInit {
  entityControl = new FormControl(['Property']);
  public themeColor = [
    { name: 'Light', class: 'light-theme' },
    { name: 'Dark', class: 'dark-theme' },
  ];
  defaultTheme = 'light-theme';
  enableDarkMode = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private commonService: CommonService,
    private workSpaceService: WorkspaceService,
    private modalController: ModalController,
    private agentService: AgentService
  ) {
    if (this.commonService.getItem('theme-mode')) {
      if (this.commonService.getItem('theme-mode') === 'dark-theme') {
        this.enableDarkMode = true;
      }
      this.themeService.activeTheme(this.commonService.getItem('theme-mode'));
    } else {
      this.themeService.activeTheme(this.defaultTheme);
    }
  }

  ngOnInit() { }

  searchHandler(term: string) { }

  goToHome() {
    this.router.navigate(['/', 'agent']);
  }
  goToWorkSpace() {
    if (!this.workSpaceService.isWorkspaceItemAvailable()) {
      this.openWorkspaceItemNotFoundModal();
      return;
    }
    this.router.navigate(['agent/workspace'], { replaceUrl: true });
  }

  private async openWorkspaceItemNotFoundModal() {
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `${DEFAULT_MESSAGES.NO_RECORD_FOUND}`,
        heading: 'Workspace',
        buttonList: [
          {
            text: 'OK',
            value: false,
          },
        ],
      },
    });

    await modal.present();
  }

  switchToDarkMode() {
    if (this.enableDarkMode) {
      this.themeService.activeTheme('dark-theme');
      this.commonService.setItem('theme-mode', 'dark-theme');
    } else {
      this.commonService.setItem('theme-mode', 'light-theme');
      this.themeService.activeTheme('light-theme');
    }
  }

  async logout() {
    const response = await this.commonService.showConfirm('Logout', 'Are you sure you want to logout?', '', 'YES', 'NO');
    if (response) {
      this.logoutAgent();
    }
  }

  private logoutAgent() {
    this.agentService.logout().subscribe(
      (res) => {
        this.commonService.resetLocalStorage();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      (error) => {
        this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Logout', 'Error');
      }
    );
  }

  goTo(pageRef: string): void {
    switch (pageRef) {
      case 'self-assessment-form':
        this.router.navigate([`/agent/hmrc/${pageRef}`]);
        break;

      default:
        break;
    }
  }
}
