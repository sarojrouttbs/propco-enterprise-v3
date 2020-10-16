import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { faultList, faultNotes } from './list.json';
import { DataTableDirective } from 'angular-datatables';
import { NotesModalPage } from '../../shared/modals/notes-modal/notes-modal.page';
import { ModalController } from '@ionic/angular';
import { async } from 'q';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  @ViewChildren(DataTableDirective) dtElements: QueryList<any>;

  dtOptions: DataTables.Settings[] = [];
  //dtTrigger: Subject<any> = new Subject();
  //notesDtTrigger: Subject<any> = new Subject();
  faultList: any[] = faultList;
  faultNotes: any[] = faultNotes;

  constructor(private modalController: ModalController, private router: Router) { }

  ngOnInit(): void {
    this.dtOptions[0] = this.buildDtOptions();
    this.dtOptions[1] = this.buildDtOptions();
    setTimeout(()=>{
      this.dtTrigger.next();
      this.notesDtTrigger.next();
    }, 1000)
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      searching: false
    };
  }

  public addFault(){
    this.router.navigate(['faults/add']);
  }

  async notesModal() {
    const headingText = 'aaa';
    const offerStatus = 'reserved';
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'notes-container',
      componentProps: {
        data: offerStatus,
        heading: headingText,
        offerStatus,
      }
    });

    const data = modal.onDidDismiss().then(res => {
    });
    await modal.present();
  }

  showMenu(event, id, data, className, isCard?) {
    const baseContainer = $(event.target).parents('.' + className);
    const divOverlay = $('#' + id);
    const baseContainerWidth = baseContainer.outerWidth(true);
    const baseContainerHeight = baseContainer.outerHeight(true);
    const baseContainerPosition = baseContainer.position();
    const baseContainerTop = baseContainerPosition.top;
    const divOverlayWidth = divOverlay.css('width', baseContainerWidth + 'px');
    const divOverlayHeight = divOverlay.height();
    const overlayContainerLeftPadding = (divOverlay.parent('.overlay-container').innerWidth() - divOverlay.parent('.overlay-container').width()) / 2;
    const divOverlayLeft = isCard ? baseContainerPosition.left : overlayContainerLeftPadding;

    let origDivOverlayHeight;
    let origDivOverlayTop;
    let divOverlayTopBottomPadding = 0;
    if (baseContainerHeight > 48) {
      divOverlayTopBottomPadding = (baseContainerHeight - 48) / 2;
    }

    if (baseContainerHeight > divOverlayHeight) {
      origDivOverlayHeight = baseContainerHeight;
      origDivOverlayTop = baseContainerTop + $('.dataTables_length').outerHeight(true);
    } else {
      origDivOverlayHeight = divOverlayHeight + (divOverlayTopBottomPadding * 2);
      const extraHeight = divOverlayHeight - baseContainerHeight;
      origDivOverlayTop = baseContainerTop - extraHeight - (divOverlayTopBottomPadding * 2) + $('.dataTables_length').outerHeight(true);
    }

    divOverlay.css({
      position: 'absolute',
      top: origDivOverlayTop,
      right: '0px',
      width: baseContainerWidth,
      height: origDivOverlayHeight,
      left: divOverlayLeft,
      paddingTop: divOverlayTopBottomPadding,
      paddingBottom: divOverlayTopBottomPadding
    });

    const gridDivOverlay = $('#grid-divoverlay');

    gridDivOverlay.css({
      width: divOverlay.width(),
      height: divOverlayHeight
    });

    divOverlay.delay(200).slideDown('fast');
    event.stopPropagation();
  }

  hideMenu(event, id) {
    const $divOverlay = $('#' + id);
    $divOverlay.delay(200).slideUp('fast');
    if (event) {
      event.stopPropagation();
    }
  }

}
