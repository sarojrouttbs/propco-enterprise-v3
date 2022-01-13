import { NgModule } from "@angular/core";
import { LookupPipe } from "./lookup-pipe";
import { AddressStringPipePipe } from './address-string-pipe.pipe';

@NgModule({
	declarations: [LookupPipe, AddressStringPipePipe],
	imports: [],
	exports: [LookupPipe, AddressStringPipePipe]
})
export class PipesModule {}