import { NgModule } from "@angular/core";
import { LookupPipe } from "./lookup-pipe";
import { AddressPipe } from './address-string-pipe.pipe';

@NgModule({
	declarations: [LookupPipe, AddressPipe],
	imports: [],
	exports: [LookupPipe, AddressPipe]
})
export class PipesModule {}