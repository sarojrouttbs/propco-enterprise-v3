import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DATE_FORMAT, PAYMENT_WARNINGS, PROPCO } from '../constants';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
const { Network } = Plugins;
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';

interface Lookupdata {
  obj: Object;
}

@Injectable({
  providedIn: 'root'
})

export class CommonService {
  private loader;
  entityType;

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private httpClient: HttpClient,
    private router: Router,
    public toastController: ToastController,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) { }

  private dataChange = new Subject<any>();
  dataChanged$ = this.dataChange.asObservable();

  private isAutosaveLoader = new Subject<any>();
  isAutosaveLoader$ = this.isAutosaveLoader.asObservable();

  dataChanged(data) {
    this.dataChange.next(data);
  }

  showAutoSaveLoader(value) {
    this.isAutosaveLoader.next(value)
  }

  async isInternetConnected(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }


  getCookie(cname) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (const element of ca) {
      let c = element;
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  getCSRFToken(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL);
  }

  authenticateSsoToken(encodedString: string): Observable<any> {
    const requestObj = { env: 'saas-uat' };
    return this.httpClient.post(environment.API_BASE_URL + 'authentication/sso/token', requestObj, {
      headers: {
        Authorization: 'Basic ' + encodedString
      }
    });
  }

  getLookup(params?: HttpParams): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'agents/lookup', { responseType: 'json', params: params });
  }

  getTobLookup(): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'agents/lookup/tob', { responseType: 'json' });
  }

  getFaultsLookup(): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'lookup/faults', { responseType: 'json' });
  }

  getSystemConfig(key: string): Observable<any> {
    const httpParams = new HttpParams().set('key', key);
    return this.httpClient.get(environment.API_BASE_URL + 'sysconfig', { params: httpParams });
  }

  getSystemOptions(option: string): Observable<any> {
    const httpParams = new HttpParams().set('option', option);
    return this.httpClient.get(environment.API_BASE_URL + 'options', { params: httpParams });
  }

  getMetaConfig(): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'meta-config', { responseType: 'json' });
  }

  getPostcodeAddressList(postcode: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `postcode/${postcode}/fetch`);
  }

  getPostcodeAddressDetails(addressId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `postcode/${addressId}/retrieve`);
  }

  getUserDetails(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `user/logged-in`);
  }


  getLookupValue(id, listOfArray): string {
    let propertyStatus;
    listOfArray = listOfArray && listOfArray.length ? listOfArray : [];
    listOfArray.find((obj) => {
      if (obj.index === id) {
        propertyStatus = obj.value;
      }
    });

    return propertyStatus;
  }

  setItem(key: string, value: any) {
    if (typeof value === 'object') {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      window.localStorage.setItem(key, value);
    }
  }

  getItem(key: string, isJson?: boolean): any {
    let data = window.localStorage.getItem(key);
    if (isJson) {
      data = JSON.parse(data);
    }
    return data;
  }

  removeItem(key: string) {
    window.localStorage.removeItem(key);
  }

  resetLocalStorage() {
    window.localStorage.clear();
  }

  checkAuthToken() {
    const data = window.localStorage.getItem(PROPCO.ACCESS_TOKEN);
    return (data ? true : false);
  }

  showMessage(message?, title?, type?) {
    if (type === 'success') {
      this.toastr.success(message, title ? title : 'Success', {
        //   disableTimeOut: true,
        closeButton: true,
        // tapToDismiss: false
        timeOut: 4000
      });
    }
    else if (type === 'error') {
      this.toastr.error(message, title ? title : 'Error', {
        timeOut: 4000,
        closeButton: true,
      });
    }
    else if (type === 'info') {
      this.toastr.info(message, title ? title : 'Info', {
        timeOut: 4000,
        closeButton: true,
      });
    }
    else if (type === 'warning') {
      this.toastr.warning(message, title ? title : 'Warning', {
        timeOut: 4000,
        closeButton: true,
      });
    }
  }

  async showAlert(title: string, displayText: string, subtitle?: string) {
    return new Promise((resolve) => {
      let alertPopup: any;
      this.alertCtrl.create({
        header: title,
        subHeader: subtitle ? subtitle : undefined,
        message: displayText,
        cssClass: 'common-alert-box',
        buttons: [{
          text: 'OK',
          handler: () => {
            alertPopup.dismiss().then((res) => {
              resolve(true);
            });
            return false;
          }
        }],
        backdropDismiss: false,
      }).then(res => {
        alertPopup = res;
        res.present();
      });

    });
  }

  async showConfirm(title: string, displayText: string, subtitle?: string, okText?: string, cancelText?: string, inputs?: any) {
    return new Promise((resolve) => {
      let alertPopup: any;
      this.alertCtrl.create({
        header: title,
        subHeader: subtitle ? subtitle : undefined,
        message: displayText,
        cssClass: 'common-alert-box',
        buttons: [
          {
            text: cancelText ? cancelText : 'Cancel',
            cssClass: 'ion-color-danger',
            role: 'cancel',
            handler: () => {
              alertPopup.dismiss().then((res) => {
                resolve(false);
              });
              return false;
            }
          },
          {
            text: okText ? okText : 'OK',
            cssClass: 'ion-color-success',
            handler: (data) => {
              alertPopup.dismiss().then((res) => {
                data ? resolve(data) : resolve(true);
              });
              return false;
            }
          }
        ],
        backdropDismiss: false,
        inputs: inputs
      }).then(res => {
        alertPopup = res;
        res.present();
      });

    });
  }

  async presentToastWithOptions(title: string, displayText: string, subtitle?: string, okText?: string, cancelText?: string) {
    return new Promise((resolve) => {
      let alertPopup: any;
      this.toastController.create({
        header: title,
        position: 'top',
        message: displayText,
        cssClass: 'common-toast-box',
        buttons: [
          {
            text: cancelText ? cancelText : 'Cancel',
            cssClass: 'ion-color-danger',
            role: 'cancel',
            handler: () => {
              alertPopup.dismiss().then((res) => {
                resolve(false);
              });
              return false;
            }
          },
          {
            text: okText ? okText : 'OK',
            cssClass: 'ion-color-success',
            handler: () => {
              alertPopup.dismiss().then((res) => {
                resolve(true);
              });
              return false;
            }
          }
        ],
      }).then(res => {
        alertPopup = res;
        res.present();
      });

    });
  }

  async presentToast(message: any, color?) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: color ? color : 'primary',
    });
    toast.present();
  }

  searchPropertyByText(text: string, isFAF?: boolean, officeList?: any, agreementStatus?: any, pageName?: string): Observable<any> {
    let params: any;
    if (isFAF && pageName !== 'application') {
      let letCategory = this.getItem(PROPCO.LET_CATEGORY, true);
      params = new HttpParams()
        .set('limit', '10')
        .set('page', '1')
        .set('text', text)
        .set('types', 'PROPERTY');

      if (letCategory) {
        params = params.set('prop.mantypeLetCat', letCategory);
      }
    }
    else if (!isFAF && pageName !== 'application') {
      params = new HttpParams()
        .set('limit', '10')
        .set('page', '1')
        .set('text', text)
        .set('prop.agreeStatus', agreementStatus)
        .set('prop.ofc', officeList)
        .set('types', 'PROPERTY');
    }
    else if (!isFAF && pageName === 'application') {
      params = new HttpParams()
        .set('limit', '10')
        .set('page', '1')
        .set('text', text)
        .set('types', 'PROPERTY');
    }
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, { params });
  }

  searchEntityByText(text: string, types: []): Observable<any> {
    let params: any;
      params = new HttpParams()
        .set('searchTerm', text)
        .set('searchSwitch',true)
        .set('searchTypes', types.toString());
    return this.httpClient.get(environment.API_BASE_URL + `entities/search`, { params });
  }

  showLoader(duration?: number) {
    const elem = document.getElementById('loading');
    if (elem) {
      elem.style.display = '';
    }
  }

  hideLoader() {
    setTimeout(() => {
      const elem = document.getElementById('loading');
      if (elem) {
        elem.style.display = 'none';
      }
    }, 500);
  }

  getResizedImageUrl(imageName: string, size?: number, mediaHostUrl?: string) {
    let srcUrl = '';
    if (imageName) {
      const mediaHost = mediaHostUrl ? mediaHostUrl : environment.MEDIA_HOST_URL;
      const fileName = imageName ? imageName : '';
      size = size ? size : 400;
      srcUrl = mediaHost + 'resize.php/' + fileName + '?resize(' + size + ')';
    }
    return srcUrl;
  }

  getHeadMediaUrl(mediaList) {
    let mediaUrl = '';
    const headMedia = mediaList.filter(media => {
      return (media.imageIndex === 1);
    });

    if (headMedia && headMedia[0] && headMedia[0].fileName) {
      mediaUrl = headMedia[0].fileName;
    }
    return mediaUrl;
  }

  encodeToBase64(str): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  downloadDocument(response, fileName, fileType?: any) {
    const type = fileType;
    const blob = new Blob([response], { type: type });
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = fileName;
    link.click();
  }

  downloadDocumentByUrl(url, name?) {
    const fileExtension = name ? name.split('.')[1] : null;
    if (fileExtension === 'doc' || fileExtension === 'odt' || fileExtension === 'docx') {
      saveAs(url, name);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = '';
      a.target = '_blank';
      a.click();
      document.body.removeChild(a);
    }
  }

  getFileNameFromContent(content) {
    let fileName = '';
    const startIndex = content.indexOf('filename') + 10;
    fileName = content.substring(startIndex, content.length - 1);
    return fileName;
  }

  logout() {
    const accessToken = window.localStorage.getItem(PROPCO.ACCESS_TOKEN);
    this.showLoader();
    this.httpClient.get(environment.API_BASE_URL + 'authentication/user/logout', {}).toPromise().finally(() => {
      this.hideLoader();
      this.resetLocalStorage();
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  camelize(str: string) {
    return str.replace(
      /\w\S*/g,
      (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  getFormatedDate(date, format?): string {
    if (typeof date !== 'undefined') {
      return new DatePipe('en-UK').transform(new Date(date), format || DATE_FORMAT.YEAR_DATE);
    }
  }

  replaceEmptyStringWithNull(requestObj): any {
    Object.keys(requestObj).forEach(key => {
      if (requestObj[key] === '') {
        requestObj[key] = null;
      }
    });
    return requestObj;
  }

  convertToString(value) {
    return (value != null) ? value.toString() : '';
  }

  getDirtyValues(form: any): any {
    const dirtyValues = {};
    Object.keys(form.controls).forEach(key => {
      const currentControl = form.controls[key];
      if (currentControl.dirty) {
        if (currentControl.controls) {
          dirtyValues[key] = this.getDirtyValues(currentControl);
        }
        else {
          dirtyValues[key] = currentControl.value;
        }
      }
    });
    return dirtyValues;
  }

  showMenu(event: any, id: any, className: any, ispaging?: any) {
    const baseContainer = $(event.target).parents('.' + className);
    const divOverlay = $('#' + id);
    const baseContainerWidth = baseContainer.outerWidth(true);
    const baseContainerHeight = baseContainer.outerHeight(true);
    const baseContainerPosition = baseContainer.position();
    const baseContainerTop = baseContainerPosition.top;
    const divOverlayHeight = divOverlay.height();
    const overlayContainerLeftPadding = (divOverlay.parent('.overlay-container').innerWidth() - divOverlay.parent('.overlay-container').width()) / 2;
    const divOverlayLeft = overlayContainerLeftPadding;
    let origDivOverlayHeight;
    let origDivOverlayTop;
    let divOverlayTopBottomPadding = 0;
    if (baseContainerHeight > 48) {
      divOverlayTopBottomPadding = (baseContainerHeight - 48) / 2;
    }

    if (baseContainerHeight > divOverlayHeight) {
      origDivOverlayHeight = baseContainerHeight;
      origDivOverlayTop = ispaging ? baseContainerTop + 38 : baseContainerTop;
    } else {
      origDivOverlayHeight = divOverlayHeight + (divOverlayTopBottomPadding * 2);
      const extraHeight = divOverlayHeight - baseContainerHeight;
      origDivOverlayTop = ispaging ? (baseContainerTop - extraHeight - (divOverlayTopBottomPadding * 2) + $('.dataTables_length').outerHeight(true)) : (baseContainerTop - extraHeight - (divOverlayTopBottomPadding * 2));
    }

    divOverlay.css({
      position: 'absolute',
      top: origDivOverlayTop + 1,
      right: '0px',
      width: baseContainerWidth,
      height: origDivOverlayHeight,
      left: divOverlayLeft + 1,
      paddingTop: divOverlayTopBottomPadding,
      paddingBottom: divOverlayTopBottomPadding
    });

    divOverlay.delay(200).slideDown('fast');
    event.stopPropagation();
  }

  hideMenu(event?: any, id?: any) {
    const $divOverlay = $('#' + id);
    $divOverlay.delay(200).slideUp('fast');
    if (event) {
      event.stopPropagation();
    }
  }

  sortBy(field: string, element: []) {

    element.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return 0;
      }
    });
    return element = element;
  }

  removeDuplicateObjects(array: any[]) {
    return [...new Set(array.map(res => JSON.stringify(res)))]
      .map(res1 => JSON.parse(res1));
  }

  getFormatedDateTime(date, format?): string {
    if (typeof date !== 'undefined') {
      return new DatePipe('en-UK').transform(new Date(date), format || DATE_FORMAT.YEAR_DATE_TIME);
    }
  }

  getPaymentWarnings(paymentRules: FaultModels.IFaultWorksorderRules, RepairEstimateThreshold?): Array<string> {
    RepairEstimateThreshold = RepairEstimateThreshold ? RepairEstimateThreshold : 250;
    const paymentWarnings: string[] = [];
    if (paymentRules && paymentRules.hasOwnProperty('hasOtherInvoicesToBePaid')) {
      if (paymentRules.hasSufficientReserveBalance === false) {
        paymentWarnings.push(PAYMENT_WARNINGS.hasSufficientReserveBalance);
      }
      if (paymentRules.hasOtherInvoicesToBePaid === true) {
        paymentWarnings.push(PAYMENT_WARNINGS.hasOtherInvoicesToBePaid);
      }
      if (paymentRules.hasRentArrears === true) {
        paymentWarnings.push(PAYMENT_WARNINGS.hasRentArrears);
      }
      if (paymentRules.hasRentPaidUpFront === true) {
        paymentWarnings.push(PAYMENT_WARNINGS.hasRentPaidUpFront);
      }
      if (paymentRules.hasTenantPaidRentOnTime === false) {
        paymentWarnings.push(PAYMENT_WARNINGS.hasTenantPaidRentOnTime);
      }
      if (paymentRules.isFaultEstimateLessThanHalfRentOrThresHoldValue === false) {
        const thresoldText = PAYMENT_WARNINGS.isFaultEstimateLessThanHalfRentOrThresHoldValue.replace('£250', `£${RepairEstimateThreshold}`);
        paymentWarnings.push(thresoldText);
      }
      if (paymentRules.isTenancyGivenNoticeOrInLastMonth === true) {
        paymentWarnings.push(PAYMENT_WARNINGS.isTenancyGivenNoticeOrInLastMonth);
      }
    }
    return paymentWarnings;
  }

  scrollToTopById(elementId) {
    const element = document.getElementById(elementId);
    element.scrollIntoView({ behavior: 'smooth' });
  }

  sanitizeHtml(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  deleteNote(noteId: number): Observable<any> {
    return this.httpClient.delete(environment.API_BASE_URL + `notes/${noteId}`, {});
  }

  getReferencingInfo(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + 'agents/referencing/info', {});
  }

  redirectUrl(url) {
    if (url && typeof url === 'string') {
      window.open(url);
    }
  }

  customizePaginator(paginatorClassName: string): void {
    setTimeout(() => {
      const lastBtn = document.querySelector(`.${paginatorClassName} .mat-paginator-navigation-last`);
      if (lastBtn) {
        lastBtn.innerHTML = 'Last';
      }
      const firstBtn = document.querySelector(`.${paginatorClassName} .mat-paginator-navigation-first`);
      if (firstBtn) {
        firstBtn.innerHTML = 'First';
      }
      const perPage = document.querySelector(`.${paginatorClassName} .mat-paginator-page-size-label`);
      if (perPage) {
        perPage.innerHTML = 'Per page';
      }
    }, 100);
  }

  getPaymentUrl(config): string {
    let url: string;
    const paymentMethod = environment.PAYMENT_METHOD;
    const paymentConfig = config[paymentMethod];
    if (environment.PAYMENT_PROD) {
      url = paymentConfig.PROD.URL;
    } else {
      url = paymentConfig.TEST.URL;
    }
    return url;
  }

  getPropertyLookup(params): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'agents/lookup/property', { params, responseType: 'json' });
  }

  removeEmpty(obj: any) {
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        delete obj[key];
      }
    }
    return obj;
  }

  sanitizeUrl(url: any) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getUserDetailsPvt(params?): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + `user/logged-in/node`, {
      params,
    });
  }
}
