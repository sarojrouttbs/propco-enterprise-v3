import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SearchSuggestionComponent } from "./search-suggestion/search-suggestion.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "src/app/material.module";
import { IonicModule } from "@ionic/angular";

@NgModule({
  declarations: [SearchSuggestionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
  ],
  exports: [SearchSuggestionComponent],
})
export class SharedModule {}
