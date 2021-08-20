import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FaultsService } from 'src/app/faults/faults.service';
import { FAULT_EVENT_TYPES, PROPCO } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
   selector: 'app-chronological-history',
   templateUrl: './chronological-history.page.html',
   styleUrls: ['./chronological-history.page.scss'],
})
export class ChronologicalHistoryPage implements OnInit {
   dtOptions: any = {};
   data: any[] = [];
   faultEventMap = new Map();
   faultEvents = [
      {
         "index": "FAULT_LOGGED",
         "value": "Fault Logged"
      },
      {
         "index": "PROGRESS_STARTED",
         "value": "Progress Started"
      },
      {
         "index": "CLI_ACTION_SELECTED",
         "value": "Cli Aaction Selected"
      },
      {
         "index": "QUOTE_OBTAINED",
         "value": "Quote Obtained"
      },
      {
         "index": "CONVERTED_TO_WO",
         "value": "Converted To WO"
      },
      {
         "index": "WO_RAISED",
         "value": "WO Raised"
      },
      {
         "index": "FAULT_CLOSED",
         "value": "Fault Closed"
      },
      {
         "index": "ESCALATED",
         "value": "Escalated"
      },
      {
         "index": "DE_ESCALATED",
         "value": "De Escalated"
      },
      {
         "index": "STAGE_CHANGED",
         "value": "Stage Changed"
      },
      {
         "index": "STATUS_CHANGED",
         "value": "Status Changed"
      },
      {
         "index": "RESPONSE_RECEIVED",
         "value": "Response Received"
      },
      {
         "index": "NOTES_ADDED",
         "value": "Notes Added"
      },
      {
         "index": "DOCUMENT_ADDED",
         "value": "Document Added"
      },
      {
         "index": "NOTIFICATION_SENT",
         "value": "Notification Sent"
      }
   ];
   faultDetails;
   isEmailRequire: boolean = false;
   eventList: any;
   dtTrigger: Subject<any> = new Subject();
   @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
   faultEventsLookup: any;
   eventTypes = FAULT_EVENT_TYPES;
   propertyDetails;
   isTableReady = false;

   constructor(private modalController: ModalController, private commonService: CommonService, private faultsService: FaultsService) {
      this.getLookupData();
   }

   private getLookupData() {
      let faultsLookupData = this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true);
      if (faultsLookupData) {
         this.setFaultsLookupData(faultsLookupData);
      }
      else {
         this.commonService.getFaultsLookup().subscribe(data => {
            this.commonService.setItem(PROPCO.FAULTS_LOOKUP_DATA, data);
            this.setFaultsLookupData(data);
         });
      }
   }

   private setFaultsLookupData(data) {
      this.faultEventsLookup = data.faultEvents;
      this.setFaultEventMap();
   }

   ngOnInit(): void {
      this.getEventList();
   }

   ngAfterViewInit(): void {
      this.dtTrigger.next();
   }

   ngOnDestroy(): void {
      this.dtTrigger.unsubscribe();
   }

   getAddressString(addressObject): string {
      let propertyAddress = null;
      if (addressObject && addressObject != null) {
         propertyAddress = (
            (addressObject.addressLine1 ? addressObject.addressLine1 + ', ' : '') +
            (addressObject.addressLine2 ? addressObject.addressLine2 + ', ' : '') +
            (addressObject.addressLine3 ? addressObject.addressLine3 + ', ' : '') +
            (addressObject.town ? addressObject.town + ', ' : '') +
            (addressObject.postcode ? addressObject.postcode + '' : '')
         );
         return propertyAddress;
      }
   }

   private getEventList() {
      this.faultsService.getFaultEvents(this.faultDetails.faultId).subscribe(async response => {
         this.eventList = [{"clientDiscriminator":"demo","faultUuid":"1c6fff95-bdbc-41a4-95d1-2ca1fbc508de","faultId":468,"reference":"FF000440","eventType":1,"data":{"by":"System (API)"},"eventAt":"2021-08-20 10:03:07"},{"clientDiscriminator":"demo","faultUuid":"1c6fff95-bdbc-41a4-95d1-2ca1fbc508de","faultId":468,"reference":"FF000440","eventType":11,"data":{"by":"System (API)","status":"IN_ASSESSMENT"},"eventAt":"2021-08-20 10:03:34"},{"clientDiscriminator":"demo","faultUuid":"1c6fff95-bdbc-41a4-95d1-2ca1fbc508de","faultId":468,"reference":"FF000440","eventType":15,"data":{"subject":"Repair Reported: 17 Farm Street: Appliances","by":"System (API)","recipient":"TENANT","from":"null","plainBody":"Dear Jada Kiss\n\n17 Farm Street Harbury Leamington Spa Warwickshire United Kingdom CV33 9LR\nThanks for reporting a repair at your property\n\nThe repair: FF000440 & washroom\n\nWhat do I need to know?\n\nWe have logged the following information from you and will use this to review and assess the details of the repair.\nJob Title: washroom\nFault Description: washroom\nAccess Information: Contacting tenant\n\nWhat do I need to do?\n\nThere is nothing for you to do at this stage. Once we have completed the assessment, we will be back in touch with more information.\n\nRegards,\n\n","to":"","body":"<style>\r\n#tick-mark {\r\n    position: relative;\r\n    display: inline-block;\r\n    width: 60px;\r\n    height: 60px;\r\n\tbackground-color: #FF941F;\r\n\tborder-radius: 50%;\r\n\tborder: 10px solid #FF941F;\r\n\tmargin: 20px 0px 0px;\r\n}\r\n\r\n#tick-mark::before {\r\n    position: absolute;\r\n    left: 50%;\r\n    top: 5%;\r\n    height: 70%;\r\n    width: 3px;\r\n    background-color: #fff;\r\n    content: \"\";\r\n}\r\n#tick-mark::after {\r\n    position: absolute;\r\n    left: 50%;\r\n    top: 90%;\r\n    height: 9%;\r\n    width: 3px;\r\n    background-color: #fff;\r\n    content: \"\";\r\n}\r\n\r\n\r\nbody {\r\n    font-family: \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\r\n    font-weight: 300;\r\n    margin: 0px;\r\n    background: #f4f4f4;\r\n}\r\np {\r\n\tfont-family: \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\r\n    font-weight: 300;\r\n    margin: 0px;\r\n    padding: 0px;\r\n}\r\n\r\n@media only screen and (min-width: 501px) {\r\n.col {\r\n\twidth: 50%;\r\n\tfloat: left;\r\n\tdisplay: flex;\r\n\tmax-height: 200px;\r\n\tmin-height: 200px;\r\n}\r\n}\r\n\r\n@media only screen and (max-width: 500px) {\r\n.col {\r\n\twidth: 50%;\r\n\tfloat: left;\r\n\tdisplay: flex;\r\n\tmax-height: 260px;\r\n\tmin-height: 260px;\r\n}\r\n}\r\n\r\n@media only screen and (max-width: 400px) {\r\n.col {\r\n\twidth: 100%;\r\n\tfloat: left;\r\n\tdisplay: flex;\r\n\tmax-height: 100%;\r\n\tmin-height: 100%;\r\n}\r\n.col p {\r\n\tpadding: 0px 20px !important\r\n}\r\n}\r\n</style>\r\n\r\n<div style=\"width: 100%; height: 100%; padding: 35px 0px; background: #f9f9f9\">\r\n  <div style=\"max-width: 600px; font-family: Arial,sans-serif; margin: 0 auto;\">\r\n    <div style=\"align-content: center; text-align: center; padding: 25px; \"><a href=\"#\"><img src=https://saas-media.propco.co.uk/b811120e-4075-4f05-bf3e-60a32b74d8ea/images/logos/cwdlogo.jpg style=\"align-self: center; max-width: 240px;\" /></a></div>\r\n    <div style=\"padding: 20px; font-size: 16px; line-height: 22px; background: #fff; border-bottom: 2px solid #561652;\">\r\n      <p style=\"font-size: 18px; padding-bottom: 20px;\">Dear Jada Kiss</p>\r\n\t  <div style=\"padding-top: 10px;\">\r\n      <p>17 Farm Street Harbury Leamington Spa Warwickshire United Kingdom CV33 9LR</p>\r\n      <br />\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 16px; line-height: 24px;\">Thanks for reporting a repair at your property</p>\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 16px; line-height: 24px;\">The repair: FF000440 & washroom</p>\r\n\t  </div>\t\t\r\n\t  <div style=\"padding-top: 30px;\">\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 18px; line-height: 24px;\">What do I need to know?</p>\r\n\t\t  <p>We have logged the following information from  you and will use this to review and assess the details of the repair.<br/><br/>Job Title: washroom<br/><br/>Fault Description: washroom<br/><br/>Access Information: Contacting tenant</p>\r\n\t  </div>\r\n\t  <div style=\"padding-top: 30px;\">\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 18px; line-height: 24px;\">What do I need to do?</p>\r\n\t\t  <p>There is nothing for you to do at this stage. Once we have completed the assessment, we will be back in touch with more information.</p>\r\n\t  </div>      <div style=\"padding-top: 30px;\">\r\n        <p>Regards,</p>\r\n        <p></p>\r\n      </div>\r\n\t  </div>\r\n   </div>\r\n</div>\r\n","notificationTemplateCode":"RP-T-E"},"eventAt":"2021-08-20 10:03:34"},{"clientDiscriminator":"demo","faultUuid":"1c6fff95-bdbc-41a4-95d1-2ca1fbc508de","faultId":468,"reference":"FF000440","eventType":2,"data":{"by":"System (API)"},"eventAt":"2021-08-20 10:03:34"},{"clientDiscriminator":"demo","faultUuid":"1c6fff95-bdbc-41a4-95d1-2ca1fbc508de","faultId":468,"reference":"FF000440","eventType":15,"data":{"subject":"Potential Repair: 17 Farm Street: Appliances","by":"System (API)","recipient":"LANDLORD","from":"null","plainBody":"Dear Mr Rollason\n\n17 Farm Street Harbury Leamington Spa Warwickshire United Kingdom CV33 9LR\nYour tenant has reported a repair at your property\n\nThe requested repair: FF000440 & washroom\n\nWhat do I need to know?\n\nYour tenant at the above property has let us know that a repair is needed.\n\nWhat do I need to do?\n\nThere is nothing for you to do at this stage. We are gaining more details to be able to assess the repair and we will be back in touch when we have more information.\nIf you would like to speak to us, please contact us on the number below.\n\nRegards,\n\n","to":"ali.rollason@techblue.co.uk","body":"<style>\r\n#tick-mark {\r\n    position: relative;\r\n    display: inline-block;\r\n    width: 60px;\r\n    height: 60px;\r\n    background-color: #FF941F;\r\n    border-radius: 50%;\r\n    border: 10px solid #FF941F;\r\n    margin: 20px 0px 0px;\r\n}\r\n\r\n#tick-mark::before {\r\n    position: absolute;\r\n    left: 50%;\r\n    top: 5%;\r\n    height: 70%;\r\n    width: 3px;\r\n    background-color: #fff;\r\n    content: \"\";\r\n}\r\n#tick-mark::after {\r\n    position: absolute;\r\n    left: 50%;\r\n    top: 90%;\r\n    height: 9%;\r\n    width: 3px;\r\n    background-color: #fff;\r\n    content: \"\";\r\n}\r\n\r\n\r\nbody {\r\n    font-family: \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\r\n    font-weight: 300;\r\n    margin: 0px;\r\n    background: #f4f4f4;\r\n}\r\np {\r\n    font-family: \"HelveticaNeue-Light\", \"Helvetica Neue Light\", \"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif;\r\n    font-weight: 300;\r\n    margin: 0px;\r\n    padding: 0px;\r\n}\r\n\r\n@media only screen and (min-width: 501px) {\r\n.col {\r\n    width: 50%;\r\n    float: left;\r\n    display: flex;\r\n    max-height: 200px;\r\n    min-height: 200px;\r\n}\r\n}\r\n\r\n@media only screen and (max-width: 500px) {\r\n.col {\r\n    width: 50%;\r\n    float: left;\r\n    display: flex;\r\n    max-height: 260px;\r\n    min-height: 260px;\r\n}\r\n}\r\n\r\n@media only screen and (max-width: 400px) {\r\n.col {\r\n    width: 100%;\r\n    float: left;\r\n    display: flex;\r\n    max-height: 100%;\r\n    min-height: 100%;\r\n}\r\n.col p {\r\n    padding: 0px 20px !important\r\n}\r\n}\r\n</style>\r\n\r\n<div style=\"width: 100%; height: 100%; padding: 35px 0px; background: #f9f9f9\">\r\n  <div style=\"max-width: 600px; font-family: Arial,sans-serif; margin: 0 auto;\">\r\n    <div style=\"align-content: center; text-align: center; padding: 25px; \"><a href=\"#\"><img src=https://saas-media.propco.co.uk/b811120e-4075-4f05-bf3e-60a32b74d8ea/images/logos/cwdlogo.jpg style=\"align-self: center; max-width: 240px;\" /></a></div>\r\n    <div style=\"padding: 20px; font-size: 16px; line-height: 22px; background: #fff; border-bottom: 2px solid #561652;\">\r\n      <p style=\"font-size: 18px; padding-bottom: 20px;\">Dear Mr Rollason</p>\r\n      <div style=\"padding-top: 10px;\">\r\n      <p>17 Farm Street Harbury Leamington Spa Warwickshire United Kingdom CV33 9LR</p>\r\n      <br />\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 16px; line-height: 24px;\">Your tenant has reported a repair at your property</p>\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 16px; line-height: 24px;\">The requested repair: FF000440 & washroom</p>\r\n      </div>        \r\n      <div style=\"padding-top: 30px;\">\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 18px; line-height: 24px;\">What do I need to know?</p>\r\n          <p>Your tenant at the above property has let us know that a repair is needed.</p>\r\n      </div>\r\n      <div style=\"padding-top: 30px;\">\r\n      <p style=\"font-weight: bold; padding-bottom: 10px; font-size: 18px; line-height: 24px;\">What do I need to do?</p>\r\n          <p>There is nothing for you to do at this stage. We are gaining more details to be able to assess the repair and we will be back in touch when we have more information.<br/><br/>If you would like to speak to us, please contact us on the number below.</p>\r\n      </div>      <div style=\"padding-top: 30px;\">\r\n        <p>Regards,</p>\r\n        <p></p>\r\n      </div>\r\n      </div>\r\n   </div>\r\n</div>\r\n","notificationTemplateCode":"RP-L-E"},"eventAt":"2021-08-20 10:03:34"},{"clientDiscriminator":"demo","faultUuid":"1c6fff95-bdbc-41a4-95d1-2ca1fbc508de","faultId":468,"reference":"FF000440","eventType":10,"data":{"stage":"FAULT_QUALIFICATION","by":"System (API)"},"eventAt":"2021-08-20 10:03:34"}]
         await this.updateEventList(this.eventList);
         this.initiateDtOptons();
         this.isTableReady = true;
         // this.rerender();
      })
   }

   initiateDtOptons() {
      this.dtOptions = {
         lengthMenu: [10, 15, 20],
         order: [[0, "desc"]],
         searching: false,
         pageLength: 10,
         pagingType: 'full_numbers',
         dom: 'Blfrtip',
            //    {
         // ajax: 'assets/data/data.json',
         buttons: [
            {
               extend: 'pdf',
               orientation: 'portrait',
               pageSize: 'A4',
               className: "pdfBtn",
               text: "Print",
               download: 'open',
               customize: (doc) => {
                  let tableBody: any = [];
                  tableBody.push([{ text: `Fault : saroj`, border: [false, false, false, false] },
                  // { text: '', border: [false, false, false, false] }, { text: '', border: [false, false, false, false] }
               ]
                  );
                  // tableBody.push([{ colSpan: 3, text: `Property Address : ${(this.propertyDetails?.reference ? this.propertyDetails?.reference + ',' : '') + (this.propertyDetails.publishedAddress ? this.propertyDetails.publishedAddress : this.getAddressString(this.propertyDetails.address))}`, border: [false, false, false, false] }]);
                  // tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  // tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  // tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);

                  // this.eventList.forEach((element) => {
                  //    // tableBody.push([{ text: 'Date/Time', style: 'tableHeader', border: [false, false, false, false] }, { text: 'Action', style: 'tableHeader', border: [false, false, false, false] }, { text: 'Event Category', style: 'tableHeader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ text: 'Date/Time', style: 'tableHeader', border: [false, false, false, false] }, { colSpan: 2, text: 'Action', style: 'tableHeader', border: [false, false, false, false] }]);
                  //    // tableBody.push([{ text: this.commonService.getFormatedDate(element.eventAt, 'dd/MM/yyyy HH:mm'), style: 'subheader', border: [false, false, false, false] }, { text: `${element.eventType || '-'}`, style: 'subheader', border: [false, false, false, false] }, { text: `${element.category || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ text: this.commonService.getFormatedDate(element.eventAt, 'dd/MM/yyyy HH:mm'), style: 'subheader', border: [false, false, false, false] }, { colSpan: 2, text: `${element.eventType || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ text: 'Notification Id', style: 'tableHeader', border: [false, false, false, false] }, { text: 'By', style: 'tableHeader', border: [false, false, false, false] }, { text: 'How', style: 'tableHeader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ text: `${element.data.notificationTemplateCode || '-'}`, style: 'subheader', border: [false, false, false, false] }, { text: `${element.data.by || '-'}`, style: 'subheader', border: [false, false, false, false] }, { text: `${element.data.how || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ colSpan: 3, text: 'Question', style: 'tableHeader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ colSpan: 3, text: `${element.data.question || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ colSpan: 3, text: 'Answer', style: 'tableHeader', border: [false, false, false, false] }]);
                  //    tableBody.push([{ colSpan: 3, text: `${element.data.responseOption || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                  //    if (this.isEmailRequire) {
                  //       tableBody.push([{ colSpan: 3, text: 'Email', style: 'tableHeader', border: [false, false, false, false] }])
                  //       tableBody.push([{ colSpan: 3, style: 'emailHeader', text: `${element.data.plainBody || '-'}`, border: [false, false, false, false] }])
                  //    }
                  //    tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, true], }]);
                  //    tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  // });
                  doc.content[1] = [
                     {
                        table: {
                           widths: ['*', '*', '*'],
                           body: tableBody
                        },
                        layout: {
                           hLineColor: function (i, node) {
                              return '#CECECE';
                           },
                        }
                     },
                  ]
                  doc.styles = {
                     emailHeader: {
                        fontSize: 12,
                        color: '#333333',
                        lineHeight: 1.1,
                     },
                     tableHeader: {
                        bold: true,
                        fontSize: 10,
                        color: '#333333',
                        lineHeight: 0.5
                     },
                     subheader: {
                        fontSize: 12,
                        color: '#333333',
                     }, pdfBtn: {
                        color: 'red'
                     }
                  };
               }
            }
         ],
         responsive: {
            details: {
               renderer: function (api, rowIdx, columns) {
                  var data = $.map(columns, function (col, i) {
                     if (col.hidden && col.data != '') {
                        return '<tr class="res-child" data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' +
                           '<td>' + col.title + ':' + '</td> ' +
                           '<td>' + col.data + '</td>' +
                           '</tr>';
                     } else {
                        return '';
                     }
                  }).join('');
                  return data ? $('<table/>').append(data) : false;
               }
            }
         }
      };
   }

   private async updateEventList(list) {
      if (Array.isArray(list)) {
         list.forEach(element => {
            element.eventType = this.faultEventMap.get(element.eventType);
            element.category = this.getCategoryByEventType(element.eventType);
            if(element.data.body){
               element.data.body = element.data.body.replace(/<img[^>]*>/g,"");
            }
         });
      }
   }

   private getCategoryByEventType(type) {
      if (type) {
         let category: any;
         this.eventTypes.forEach((element, index) => {
            if (new RegExp(Object.values(element)[0].join("|").toLowerCase()).test(type.toLowerCase())) {
               category = Object.keys(element)[0];
            }
         });
         return category;
      }
   }

   rerender(): void {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
         // Destroy the table first
         dtInstance.destroy();
         // Call the dtTrigger to rerender again
         this.dtTrigger.next();
      });
   }


   private setFaultEventMap() {
      this.faultEventsLookup.map((event, index) => {
         this.faultEventMap.set(event.index, event.value);
      });
   }
   dismiss() {
      this.modalController.dismiss();
   }
}
