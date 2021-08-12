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
      this.dtOptions = {
         order: [[0, "desc"]],
         searching: false,
         pageLength: 10,
         pagingType: 'full_numbers',
         dom: 'Bfrtip',
         // ajax: 'assets/data/data.json',
         buttons: [
            {
               extend: 'pdfHtml5',
               orientation: 'portrait',
               pageSize: 'A4',
               className: "pdfBtn",
               text: "Export",
               customize: (doc) => {
                  let tableBody: any = [];
                  tableBody.push([{ text: `Fault : ${this.faultDetails.reference}`, border: [false, false, false, false] },
                  { text: '', border: [false, false, false, false] }, { text: '', border: [false, false, false, false] }]);
                  tableBody.push([{ colSpan: 3, text: `Property Address : 000002063, Cobourg House, Mayflower Street, PL1 1DJ`, border: [false, false, false, false] }]);
                  tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);
                  tableBody.push([{ colSpan: 3, text: '', border: [false, false, false, false], }]);

                  this.eventList.forEach((element) => {
                     tableBody.push([{ text: 'Date/Time', style: 'tableHeader', border: [false, false, false, false] }, { text: 'Action', style: 'tableHeader', border: [false, false, false, false] }, { text: 'Event Category', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: this.commonService.getFormatedDate(element.eventAt, 'MMM d, y, h:mm'), style: 'subheader', border: [false, false, false, false] }, { text: `${element.eventType || '-'}`, style: 'subheader', border: [false, false, false, false] }, { text: `${element.category || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: 'Notification id', style: 'tableHeader', border: [false, false, false, false] }, { text: 'By', style: 'tableHeader', border: [false, false, false, false] }, { text: 'How', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: `${element.data.notificationTemplateCode || '-'}`, style: 'subheader', border: [false, false, false, false] }, { text: `${element.data.by || '-'}`, style: 'subheader', border: [false, false, false, false] }, { text: `${element.data.how || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: 'Question', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: `${element.data.question || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: 'Answer', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: `${element.data.responseOption || '-'}`, style: 'subheader', border: [false, false, false, false] }]);
                     if (this.isEmailRequire) {
                        tableBody.push([{ colSpan: 3, text: 'Email', style: 'tableHeader', border: [false, false, false, false] }])
                        tableBody.push([{ colSpan: 3, style: 'emailHeader', text: `${element.data.plainBody || '-'}`, border: [false, false, false, false] }])
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
                     }
                  };
               }
            }
         ],
         responsive: true
      };
      this.getEventList();
   }

   ngAfterViewInit(): void {
      this.dtTrigger.next();
   }

   ngOnDestroy(): void {
      this.dtTrigger.unsubscribe();
   }

   private getEventList() {
      this.faultsService.getFaultEvents(this.faultDetails.faultId).subscribe(async response => {
         this.eventList = response ? response : [];
         await this.updateEventList(this.eventList);
         this.rerender();
      })
   }

   private async updateEventList(list) {
      if (Array.isArray(list)) {
         list.forEach(element => {
            element.eventType = this.faultEventMap.get(element.eventType);
            element.category = this.getCategoryByEventType(element.eventType);
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
