import { Component, OnInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FaultsService } from 'src/app/faults/faults.service';
import { DATE_FORMAT, DEFAULTS, FAULT_EVENT_TYPES, FAULT_EVENT_TYPES_ID, LL_INSTRUCTION_TYPES, PROPCO } from '../../../shared/constants';
import { CommonService } from '../../../shared/services/common.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as  pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs= pdfFonts.pdfMake.vfs;

@Component({
   selector: 'app-chronological-history',
   templateUrl: './chronological-history.page.html',
   styleUrls: ['./chronological-history.page.scss'],
})
export class ChronologicalHistoryPage implements OnInit {
   dtOptions: any = {};
   data: any[] = [];
   faultEventMap = new Map();
   cliActionMap = new Map();
   LL_INSTRUCTION_TYPES = LL_INSTRUCTION_TYPES;
   faultEvents = [
      {
         "index": "FAULT_LOGGED",
         "value": "Repair Logged"
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
         "value": "Repair Closed"
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
   showAll: boolean = true;
   isNotConfigured:boolean = false;
   DEFAULTS = DEFAULTS;
   DATE_FORMAT = DATE_FORMAT;
   
   constructor(private modalController: ModalController, private commonService: CommonService, private faultsService: FaultsService, private elementRef: ElementRef) {
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
         this.eventList = response ? response : [];
         this.eventList = this.eventList.sort((a, b) => {
            return <any>new Date(b.eventAt) - <any>new Date(a.eventAt);
         });
         await this.updateEventList(this.eventList);
         this.initiateDtOptons();
         this.isTableReady = true;
      }, error => {
         if(error && error.status === 451){
            this.isNotConfigured = true;
         }
      });
   }

   initiateDtOptons() {
      this.dtOptions = {
         lengthMenu: [10, 15, 20],
         searching: false,
         pageLength: 10,
         pagingType: 'full_numbers',
         dom: 'Blfrtip',
         //    {
         // ajax: 'assets/data/data.json',
         buttons: [
            {
               extend: 'pdfHtml5',
               orientation: 'portrait',
               pageSize: 'A4',
               className: "pdf-button",
               text: "Print",
               download: 'open',
               title: ' ',
               customize: (doc) => {
                  let tableBody: any = [];
                  tableBody.push([
                     { colSpan: 3, text: `Repair Chronological History`, border: [false, false, false, false], style: 'pageTitle' },
                     { text: '', border: [false, false, false, false] }, { text: '', border: [false, false, false, false] }
                  ]);
                  tableBody.push([
                     { colSpan: 3, text: `Repair : ${this.faultDetails.reference}`, border: [false, false, false, false], style: 'pageHeader' },
                     { text: '', border: [false, false, false, false] }, { text: '', border: [false, false, false, false] }
                  ]);
                  tableBody.push([{
                     colSpan: 3, text: `Address : ${(this.propertyDetails?.reference ? this.propertyDetails?.reference + ',' : '')
                        + (this.propertyDetails.publishedAddress ? this.propertyDetails.publishedAddress : this.getAddressString(this.propertyDetails.address))}`,
                     border: [false, false, false, false], style: 'pageHeader'
                  }]);
                  tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);

                  this.eventList.forEach((element) => {
                     tableBody.push([{ text: 'Date/Time', style: 'tableHeader', border: [false, false, false, false] }, { colSpan: 2, text: 'Action', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: this.commonService.getFormatedDate(element.eventAt, this.DATE_FORMAT.DATE_TIME_SECONDS), style: 'subheader', border: [false, false, false, false] }, { colSpan: 2, text: `${element.eventType || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);

                     if (FAULT_EVENT_TYPES_ID.RESPONSE_RECEIVED === element.eventTypeId) {
                        tableBody.push([
                           { text: 'Notification Id', style: 'tableHeader', border: [false, false, false, false] },
                           { text: 'By', style: 'tableHeader', border: [false, false, false, false] },
                           { text: 'How', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([
                           { text: `${element.data.notificationTemplateCode || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] },
                           { text: `${element.data.by || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] },
                           { text: `${element.data.how || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: 'Rejection Reason', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.rejectionReason || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: 'Question', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.question || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: 'Answer', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.responseOption || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);

                        tableBody.push([{ colSpan: 3, text: 'Subject', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.subject || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);

                        if (this.isEmailRequire) {
                           tableBody.push([{ colSpan: 3, text: 'Email', style: 'tableHeader', border: [false, false, false, false] }])
                           tableBody.push([{ colSpan: 3, style: 'emailHeader', text: `${element.data.plainBody || this.DEFAULTS.NOT_AVAILABLE}`, border: [false, false, false, false] }])
                        }

                     }
                     else if (FAULT_EVENT_TYPES_ID.NOTIFICATION_SENT === element.eventTypeId) {
                        tableBody.push([
                           { text: 'Notification Id', style: 'tableHeader', border: [false, false, false, false] },
                           { text: 'By', style: 'tableHeader', border: [false, false, false, false] },
                           { text: 'Recipient', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([
                           { text: `${element.data.notificationTemplateCode || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] },
                           { text: `${element.data.by || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] },
                           { text: `${element.data.recipient || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);

                        tableBody.push([
                           { colSpan: 3, text: 'From', style: 'tableHeader', border: [false, false, false, false] }
                        ]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.from || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }])
                        tableBody.push([
                           { colSpan: 3, text: 'To', style: 'tableHeader', border: [false, false, false, false] },
                        ]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.to || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);

                        tableBody.push([{ colSpan: 3, text: 'Subject', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.subject || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        if (this.isEmailRequire) {
                           tableBody.push([{ colSpan: 3, text: 'Email', style: 'tableHeader', border: [false, false, false, false] }])
                           tableBody.push([{ colSpan: 3, style: 'emailHeader', text: `${element.data.plainBody || this.DEFAULTS.NOT_AVAILABLE}`, border: [false, false, false, false] }])
                        }
                     }
                     else if (FAULT_EVENT_TYPES_ID.NOTES_ADDED === element.eventTypeId) {
                        tableBody.push([{ text: 'Category', style: 'tableHeader', border: [false, false, false, false] },
                        { text: 'By', style: 'tableHeader', border: [false, false, false, false] },
                        { text: 'Type', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ text: `${element.data.category || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] },
                        { text: `${element.data.by || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] },
                        { text: `${element.data.type || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);

                        tableBody.push([{ colSpan: 3, text: 'Note Description', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.noteDescription.replace(/<br[^>]*>/g, "") || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                     }
                     else {
                        tableBody.push([{ colSpan: 3, text: 'By', style: 'tableHeader', border: [false, false, false, false] }]);
                        tableBody.push([{ colSpan: 3, text: `${element.data.by || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        
                        if (FAULT_EVENT_TYPES_ID.FAULT_CLOSED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Closing Reason', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${element.data.closingReason || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                        if (FAULT_EVENT_TYPES_ID.STAGE_CHANGED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Stage', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${element.data.stage || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                        if (FAULT_EVENT_TYPES_ID.CLI_ACTION_SELECTED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Cli Selected Action', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${element.data.cliSelectedAction || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                        if (FAULT_EVENT_TYPES_ID.STATUS_CHANGED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Status', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${element.data.status || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                        if (FAULT_EVENT_TYPES_ID.FAULT_SNOOZED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Snoozed Till', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${this.commonService.getFormatedDate(element.data.snoozeUntilDate, this.DATE_FORMAT.DATE) || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                        if (FAULT_EVENT_TYPES_ID.DOCUMENT_ADDED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Document', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${element.data.document || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                        if (FAULT_EVENT_TYPES_ID.ESCALATED === element.eventTypeId) {
                           tableBody.push([{ colSpan: 3, text: 'Escalation Reason', style: 'tableHeader', border: [false, false, false, false] }]);
                           tableBody.push([{ colSpan: 3, text: `${element.data.escalationReason || this.DEFAULTS.NOT_AVAILABLE}`, style: 'subheader', border: [false, false, false, false] }]);
                        }
                     }
                     tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, true], }]);
                     tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  });
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
                     },
                     pageHeader: {
                        fontSize: 13,
                        bold: true,
                        alignment: "center"
                     },
                     pageTitle: {
                        fontSize: 14,
                        bold: true,
                        alignment: "center"
                     }
                  };
               }
            }
         ],
         columnDefs: [{
            className: 'dtr-control',
            orderable: false,
            targets: 0
         }],
         order: [[1, 'asc']],
         responsive: {
            details: {
               target: 'tr',
               type: 'column',
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
         },
         drawCallback: () => {
            this.elementRef.nativeElement.querySelector('.paginate_button').addEventListener('click', this.collapseAll());
         }
      };

      if(this.eventList && this.eventList.length === 0) {
         this.dtOptions['buttons'] = [];
      }
   }

   private async updateEventList(list) {
      if (Array.isArray(list)) {
         list.forEach(element => {
            element.eventTypeId = element.eventType;
            element.eventType = this.faultEventMap.get(element.eventType);
            element.data.cliSelectedAction = this.cliActionMap.get(element.data.cliSelectedAction);
               element.category = this.getCategoryByEventType(element);
            if (element.data.body) {
               element.data.body = element.data.body.replace(/<img[^>]*>/g, "");
               element.data.body = this.commonService.sanitizeHtml(element.data.body);
            }
         });
      }
   }

   private getCategoryByEventType(elem) {
      if (elem.eventType) {
         let category: any;
         this.eventTypes.forEach((element, index) => {
            if (new RegExp(Object.values(element)[0].join("|").toLowerCase()).test(elem.eventType.toLowerCase())) {
               category = Object.keys(element)[0];
               if(elem.eventTypeId === FAULT_EVENT_TYPES_ID.NOTIFICATION_SENT && elem.data.recipient)
                  category = `${category}(${elem.data.recipient})`; 
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
      this.LL_INSTRUCTION_TYPES.map((event, index) => {
         this.cliActionMap.set(event.index, event.value);
      });
   }

   dismiss() {
      this.modalController.dismiss();
   }

   showHideAll(type) {
      var table = $('#chronological').DataTable();
      if (type) {
         this.showAll = false;
         table.rows(':not(.parent)').nodes().to$().find('td:first-child').trigger('click');
      }
      else {
         this.showAll = true;
         table.rows('.parent').nodes().to$().find('td:first-child').trigger('click');
      }
   }

   collapseAll(){
      this.showAll = true;
      var table = $('#chronological').DataTable(); 
      table.rows('.parent').nodes().to$().find('td:first-child').trigger('click');
   }
}
