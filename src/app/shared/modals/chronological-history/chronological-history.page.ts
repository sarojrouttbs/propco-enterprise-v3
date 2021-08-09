import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
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

   constructor(private modalController: ModalController, private commonService: CommonService) {
      this.setFaultEventMap();
   }

   ngOnInit(): void {
      this.dtOptions = {
         order: [[0, "desc"]],
         searching: false,
         dom: 'Bfrtip',
         ajax: 'assets/data/data.json',
         columns: [{
            title: 'Date/Time',
            data: 'eventAt',
            render: (eventAt) => { return this.commonService.getFormatedDate(eventAt, 'MMM d, y, h:mm') }
         }, {
            title: 'Action',
            data: 'faultEventType',
            render: (faultEventType) => { return this.faultEventMap.get(faultEventType) }
         }, {
            title: 'Event Category',
            data: 'category'
         }, {
            title: 'By',
            data: 'data.By',
            defaultContent: '-',
            class: 'none'
         },
         {
            title: 'Notification TemplateCode',
            data: 'data.notificationTemplateCode',
            defaultContent: '-',
            class: 'none'
         },
         {
            title: 'Question',
            data: 'data.question',
            defaultContent: '-',
            class: 'none'
         },
         {
            title: 'Response Option',
            data: 'data.responseOption',
            defaultContent: '-',
            class: 'none'
         },
         {
            title: 'How',
            data: 'data.how',
            defaultContent: '-',
            class: 'none'
         },
            // {
            //    title: 'Email',
            //    data: 'data.body',
            //    defaultContent: '-',
            //    class: 'none'
            // }
         ],
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

                  doc.content[1].table.body.forEach((line, i) => {
                     tableBody.push([{ text: 'Date/Time', style: 'tableHeader', border: [false, false, false, false] }, { text: 'Action', style: 'tableHeader', border: [false, false, false, false] }, { text: 'Event Category', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: 'Aug 2, 2021, 5:20', style: 'subheader', border: [false, false, false, false] }, { text: 'Fault Closed', style: 'subheader', border: [false, false, false, false] }, { text: 'Major Event', style: 'subheader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: 'Notification id', style: 'tableHeader', border: [false, false, false, false] }, { text: 'By', style: 'tableHeader', border: [false, false, false, false] }, { text: 'How', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ text: 'CQ-NA-CE', style: 'subheader', border: [false, false, false, false] }, { text: 'Aman', style: 'subheader', border: [false, false, false, false] }, { text: 'Email', style: 'subheader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: 'Question', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: 'Do you want to proceed with the quote?', style: 'subheader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: 'Answer', style: 'tableHeader', border: [false, false, false, false] }]);
                     tableBody.push([{ colSpan: 3, text: 'Yes, accepted', style: 'subheader', border: [false, false, false, false] }]);
                     if (this.isEmailRequire) {
                        tableBody.push([{ colSpan: 3, text: 'Email', style: 'tableHeader', border: [false, false, false, false] }])
                        tableBody.push([{ colSpan: 3, style: 'emailHeader', text: `N/A`, border: [false, false, false, false] }])
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
   }

   private setFaultEventMap() {
      this.faultEvents.map((event, index) => {
         this.faultEventMap.set(event.index, event.value);
      });
   }
   dismiss() {
      this.modalController.dismiss();
   }
}
