import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { PROPCO } from '../constants';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
const { Network } = Plugins;
import { ToastController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';

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
  ) {
  }

  private dataChange = new Subject<any>();
  dataChanged$ = this.dataChange.asObservable();

  dataChanged(data) {
    this.dataChange.next(data);
  }

  // isCordovaDevice(){
  //     return (this._platform.platforms().indexOf('cordova')!= -1) ? true : false;
  // }

  async isInternetConnected(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
    //  NetworkStatus: {
    //   connected : boolean;
    //   connectionType : any;
    //   }
  }


  getCookie(cname) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (const element of ca) {
      let c = element;
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  getCSRFToken(): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL);
  }

  authenticateSsoToken(encodedString: string): Observable<any> {
    const requestObj = { env: 'saas-cw-uat' };
    return this.httpClient.post(environment.API_BASE_URL + 'authentication/sso/token', requestObj, {
      headers: {
        Authorization: 'Basic ' + encodedString
      }
    });
  }
  
  getLookup(): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'agents/lookup', { responseType: 'json' });
  }

  getMetaConfig(): Observable<Lookupdata> {
    return this.httpClient.get<Lookupdata>(environment.API_BASE_URL + 'meta-config', { responseType: 'json' });
  }

  getPostcodeAddressList(postcode: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + postcode + '/fetch');
  }

  getPostcodeAddressDetails(addressId: string): Observable<any> {
    return this.httpClient.get(environment.API_BASE_URL + addressId + '/retrieve');
  }


  getLookupValue(id, listOfArray): string {
    let propertyStatus;
    listOfArray = listOfArray && listOfArray.length ? listOfArray : [];
    listOfArray.find((obj) => {
      if (obj.index === id) {
        propertyStatus = obj.value;
      }
    })
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
        // disableTimeOut: true,
        closeButton: true,
        // tapToDismiss: false
      });
    }
    else if (type === 'info') {
      this.toastr.info(message, title ? title : 'Info', {
        timeOut: 4000,
        // disableTimeOut: true,
        closeButton: true,
        // tapToDismiss: false
      });
    }
    else if (type === 'warning') {
      this.toastr.warning(message, title ? title : 'Warning', {
        timeOut: 4000,
        // disableTimeOut: true,
        closeButton: true,
        // tapToDismiss: false
      });
    }
  }

  async showAlert(title: string, displayText: string, subtitle?: string) {
    return new Promise((resolve, reject) => {
      let alertPopup: any;
      this.alertCtrl.create({
        header: title,
        subHeader: subtitle ? subtitle : undefined,
        message: displayText,
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

  async showConfirm(title: string, displayText: string, subtitle?: string) {
    return new Promise((resolve, reject) => {
      let alertPopup: any;
      this.alertCtrl.create({
        header: title,
        subHeader: subtitle ? subtitle : undefined,
        message: displayText,
        buttons: [
          {
            text: 'Cancel',
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
            text: 'OK',
            cssClass: 'ion-color-success',
            handler: () => {
              alertPopup.dismiss().then((res) => {
                resolve(true);
              });
              return false;
            }
          }
        ],
        backdropDismiss: false,
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

  showLoader(duration?: number) {
    // this.loader = await this.loadingCtrl.create({
    //   message: 'Loading...',
    //   spinner: 'crescent'
    // });
    // await this.loader.present();
    const elem = document.getElementById('loading');
    elem.style.display = '';
  }

  hideLoader() {
    // if (this.loader) {
    //   this.loader.dismiss();
    // }
    const elem = document.getElementById('loading');
    elem.style.display = 'none';
  }

  getResizedImageUrl(url, size?) {
    let srcUrl = '';
    if (url) {
      const splitUrl = url.split('images/');
      const mediaHost = (splitUrl.length > 0) ? splitUrl[0] : '';
      const fileName = (splitUrl.length > 0) ? splitUrl[1] : '';
      size = size ? size : 400;
      srcUrl = mediaHost + 'images/resize.php/' + fileName + '?resize(' + size + ')';
    }
    return srcUrl;
    // let srcUrl = '';
    // if (imageName) {
    //   let mediaHost = environment.MEDIA_HOST_URL;
    //   let fileName = imageName ? imageName : '';
    //   size = size ? size : 400;
    //   srcUrl = mediaHost + 'images/resize.php/' + fileName + '?resize(' + size + ')';
    // }
    // return srcUrl;
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

  downloadDocument(response) {
    const blob = new Blob([response], { type: 'application/pdf' });
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = 'file.pdf';
    link.click();
  }

  getFileNameFromContent(content) {
    let fileName = '';
    const startIndex = content.indexOf('filename') + 10;
    fileName = content.substring(startIndex, content.length - 1);
    return fileName;
  }

  logout() {
    const accessToken = window.localStorage.getItem(PROPCO.ACCESS_TOKEN);
    /* let queryParams = {'token': accessToken}; */
    /* this.resetLocalStorage(); */
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
    if (typeof date !== 'undefined' && !isNaN(date)) {
      return new DatePipe('en-UK').transform(new Date(date), format || 'yyyy-MM-dd');
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
        if (currentControl.controls){
          dirtyValues[key] = this.getDirtyValues(currentControl);
        }
        else{
          dirtyValues[key] = currentControl.value;
        }
      }
    });
    return dirtyValues;
  }

}