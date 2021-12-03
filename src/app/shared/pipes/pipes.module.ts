import { NgModule } from "@angular/core";
import { LookupPipe } from "./lookup-pipe";

@NgModule({
	declarations: [LookupPipe],
	imports: [],
	exports: [LookupPipe]
})
export class PipesModule {}