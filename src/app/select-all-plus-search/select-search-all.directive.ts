import { AfterViewInit, ContentChild, Directive, HostListener, Renderer2 } from '@angular/core';
import { IonSelect } from '@ionic/angular';

@Directive({
  selector: '[selectSearchAllDirective]'
})
export class SelectSearchAllDirective implements AfterViewInit {

  @ContentChild(IonSelect) ionSelect: IonSelect;
  constructor(private renderer: Renderer2) { }

  ngAfterViewInit() {
    (this.ionSelect as any).el.style.pointerEvents = 'none';
  }

  @HostListener('click', ['$event'])
  onClick() {
    this.ionSelect.open().then((alert: HTMLIonAlertElement) => {
      const checkboxes = Array.from(alert.querySelectorAll('.alert-checkbox'));
      const selectAllPlusSearchEl: any = document.createElement('c-select-all-plus-search');
      selectAllPlusSearchEl.addEventListener('searchChange', e => {
        checkboxes.forEach((c: HTMLElement) => c.style.display = c.innerText?.toLowerCase()?.includes(e?.detail?.toLowerCase()) ? 'block' : 'none');
      });
      selectAllPlusSearchEl.addEventListener('selectAllChange', e => {
        alert.inputs = alert.inputs.map(i => {
          i.checked = e.detail;
          return i;
        });
        selectAllPlusSearchEl.indeterminate = false;
      });
      const alertWrapperEl = alert.querySelector('.alert-wrapper');
      const messageEl = alert.querySelector('.alert-wrapper .alert-message');
      alertWrapperEl.insertBefore(selectAllPlusSearchEl, messageEl);
      const len = checkboxes.filter((c: any) => c.ariaChecked === 'true')?.length ?? 0;
      if (len === 0) {
        selectAllPlusSearchEl.checked = true;
        selectAllPlusSearchEl.indeterminate = false;
        alert.inputs = alert.inputs.map(i => {
          i.checked = true;
          return i;
        });
      }
      const setState = () => {
        const isAllCheckedElsLength = checkboxes.filter((c: any) => c.ariaChecked === 'true')?.length ?? 0;
        const isAllChecked = isAllCheckedElsLength == checkboxes?.length;       
        selectAllPlusSearchEl.checked = false;
        if (isAllChecked || isAllCheckedElsLength == 0) {
          selectAllPlusSearchEl.indeterminate = false;
          selectAllPlusSearchEl.checked = true;
        } else {
          selectAllPlusSearchEl.indeterminate = true;
        }
      };
      setState();
      checkboxes.forEach(ci => this.renderer.listen(ci, 'click', () => {
        setTimeout(setState);
      }));
    });
  }
}
