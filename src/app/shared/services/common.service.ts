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

interface lookupdata {
  obj: Object;
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private loader;
  entityType;

  constructor(
    private _alertCtrl: AlertController,
    private _loadingCtrl: LoadingController,
    private _httpClient: HttpClient,
    private _router: Router,
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
    let status = await Network.getStatus();
    return status.connected;
    //  NetworkStatus: {
    //   connected : boolean;
    //   connectionType : any;
    //   }
  }


  getCookie(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
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
    return this._httpClient.get(environment.API_BASE_URL);
  }

  getLookup(): Observable<lookupdata> {
    return this._httpClient.get<lookupdata>(environment.API_BASE_URL + 'agent/lookup', { responseType: 'json' });
  }

  getPostcodeAddressList(postcode: string): Observable<any> {
    return this._httpClient.get(environment.API_BASE_URL + postcode + '/fetch');
  }

  getPostcodeAddressDetails(addressId: string): Observable<any> {
    return this._httpClient.get(environment.API_BASE_URL + addressId + '/retrieve');
  }


  getLookupValue(listOfArray, id): string {
    let propertyStatus;
    listOfArray = listOfArray && listOfArray.length ? listOfArray : [];
    listOfArray.find((obj) => {
      if (obj.index == id) {
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
      this._alertCtrl.create({
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
      this._alertCtrl.create({
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

  async presentToast(message, color?) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color ? color : 'primary',
    });
    toast.present();
  }

  showLoader(duration?: number) {
    // this.loader = await this._loadingCtrl.create({
    //   message: 'Loading...',
    //   spinner: 'crescent'
    // });
    // await this.loader.present();
    var elem = document.getElementById('loading');
    elem.style.display = '';
  }

  hideLoader() {
    // if (this.loader) {
    //   this.loader.dismiss();
    // }
    var elem = document.getElementById('loading');
    elem.style.display = 'none';
  }

  getResizedImageUrl(url, size?) {
    let srcUrl = '';
    if (url) {
      let splitUrl = url.split('images/');
      let mediaHost = (splitUrl.length > 0) ? splitUrl[0] : '';
      let fileName = (splitUrl.length > 0) ? splitUrl[1] : '';
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
    var blob = new Blob([response], { type: 'application/pdf' });
    var downloadURL = window.URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = "file.pdf";
    link.click();
  }

  getFileNameFromContent(content) {
    let fileName = '';
    let startIndex = content.indexOf('filename') + 10;
    fileName = content.substring(startIndex, content.length - 1);
    return fileName;
  }

  logout() {
    const accessToken = window.localStorage.getItem(PROPCO.ACCESS_TOKEN);
    /* let queryParams = {'token': accessToken}; */
    /* this.resetLocalStorage(); */
    this.showLoader();
    this._httpClient.get(environment.API_BASE_URL + 'authentication/user/logout', {}).toPromise().finally(() => {
      this.hideLoader();
      this.resetLocalStorage();
      this._router.navigate(['/login'], { replaceUrl: true });
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
    if (typeof date !== "undefined" && isNaN(date)) {
      return new DatePipe('en-UK').transform(new Date(date), format || 'yyyy-MM-dd');
    }
  }

  replaceEmptyStringWithNull(requestObj): any {
    Object.keys(requestObj).forEach(key => {
      if (requestObj[key] == '') {
        requestObj[key] = null
      }
    });
    return requestObj;
  }

  convertToString(value) {
    return (value != null) ? value.toString() : '';
  }

  getDirtyValues(form: any): any {
    let dirtyValues = {};
    Object.keys(form.controls).forEach(key => {
      let currentControl = form.controls[key];
      if (currentControl.dirty) {
        if (currentControl.controls)
          dirtyValues[key] = this.getDirtyValues(currentControl);
        else
          dirtyValues[key] = currentControl.value;
      }
    });
    return dirtyValues;
  }

}