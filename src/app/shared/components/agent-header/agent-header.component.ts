import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
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
    private commonService: CommonService
  ) {
    if (this.commonService.getItem("theme-mode")) {
      if(this.commonService.getItem("theme-mode") === 'dark-theme'){
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
    this.router.navigate(["agent/entity/property/dashboard"]);
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
