import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { WorkspaceService } from "src/app/agent/workspace/workspace.service";
import { DEFAULTS, DEFAULT_MESSAGES } from "../../constants";
import { SimpleModalPage } from "../../modals/simple-modal/simple-modal.page";
import { CommonService } from "../../services/common.service";
import { ThemeService } from "../../services/theme.service";

@Component({
  selector: "app-agent-header",
  templateUrl: "./agent-header.component.html",
  styleUrls: ["./agent-header.component.scss"],
})
export class AgentHeaderComponent implements OnInit {
  entityControl = new FormControl(["Property"]);
  public themeColor = [
    { name: "Light", class: "light-theme" },
    { name: "Dark", class: "dark-theme" },
  ];
  defaultTheme: string = "light-theme";
  enableDarkMode: boolean = false;
  constructor(
    private router: Router,
    private theme: ThemeService,
    private commonService: CommonService,
    private workSpaceService: WorkspaceService,
    private modalController: ModalController
  ) {
    if (this.commonService.getItem("theme-mode")) {
      if (this.commonService.getItem("theme-mode") === "dark-theme") {
        this.enableDarkMode = true;
      }
      this.theme.activeTheme(this.commonService.getItem("theme-mode"));
    } else {
      this.theme.activeTheme(this.defaultTheme);
    }
  }

  ngOnInit() {}

  searchHandler(term) {}

  goToHome() {
    this.router.navigate(["/", "agent"]);
  }
  goToWorkSpace() {
    if (!this.workSpaceService.isWorkspaceItemAvailable()) {
      this.openWorkspaceItemNotFoundModal();
      return;
    }
    this.router.navigate(["agent/workspace"], { replaceUrl: true });
  }

  async openWorkspaceItemNotFoundModal() {
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: "modal-container alert-prompt",
      backdropDismiss: false,
      componentProps: {
        data: `${DEFAULT_MESSAGES.NO_DATA_FOUND}`,
        heading: "Workspace",
        buttonList: [
          {
            text: "OK",
            value: false,
          },
        ],
      },
    });

    await modal.present();
  }

  switchToDarkMode() {
    if (this.enableDarkMode) {
      this.theme.activeTheme("dark-theme");
      this.commonService.setItem("theme-mode", "dark-theme");
    } else {
      this.commonService.setItem("theme-mode", "light-theme");
      this.theme.activeTheme("light-theme");
    }
  }
}
