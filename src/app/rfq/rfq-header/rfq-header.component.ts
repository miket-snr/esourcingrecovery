import { Component, OnInit, OnDestroy, Output, ViewChild } from '@angular/core';
import { RFQHeader, DMSHeader, RfqControl, Tender } from '@app/_models';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { FileSaverService } from 'ngx-filesaver';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '@app/_modal';
import { borderTopRightRadius } from 'html2canvas/dist/types/css/property-descriptors/border-radius';

@Component({
  selector: 'app-rfq-header',
  templateUrl: './rfq-header.component.html',
  styleUrls: ['./rfq-header.component.less']
})
export class RfqHeaderComponent implements OnInit, OnDestroy {
  @ViewChild('f', { static: false }) reassignform: NgForm;
  public docsload = 'UP';
  public docsdirection = 'Show Docs for Download';
  public panelname = 'quote';
  public tender: Tender;
  public lclrfqdoc: RFQHeader;
  public biddoclist = [];
  public rfqControl: RfqControl;
  public lclrequest = '';
  public lclReqtext = '';
  public preview = '';
  public showmore = true;
  public rejectionText = '';
  public rejectionOnce = '';
  public myFile: string;
  public chosendoclist: DMSHeader[];
  public hideheader = false;
  public headerText = 'Request for Quotation';
  public docsoutstanding = '';
  public tendergps = 'https://www.google.com/maps/search/?api=1&query=';
  public tabIndex = new Array(true, false, false, false, false);
  responseform: FormGroup = this.fb.group({
    response: [null],
    validity: ''
  });
  constructor(
    public apirfqdoc: RfqAPIService,
    public filesaver: FileSaverService,
    private fb: FormBuilder,
    private router: Router,
    public modalService: ModalService
  ) {


  }

  ngOnInit() {
    if (!this.apirfqdoc.currentTender) {
      this.router.navigate(
        ['esourcing']);
    }
    this.apirfqdoc.docsoutstanding.subscribe((doc) => {
      this.docsoutstanding = doc;
    });
    this.apirfqdoc.currentTender.subscribe(tenderdata => {
      if (tenderdata) {
        this.tender = tenderdata;
      }
    });
    this.apirfqdoc.headerTextOB.subscribe((txt) => {
      this.headerText = txt;
    });

    if (this.tender) {

      // tslint:disable-next-line:max-line-length
      this.tendergps = (this.tender.locationgps) ? 'https://www.google.com/maps/search/?api=1&query=' + this.tender.locationgps.split(';').join(',') : '';

      if (this.tender.response) {
        this.responseform.setValue({
          response: this.tender.response.response ? this.tender.response.response : '',
          validity: this.tender.response.validity ? this.tender.response.validity : ''
        });
        // this.lclrfqdoc = this.tender.rfqNo;
      }
      this.lclReqtext = this.tender.reqText;
      const requestarray = this.tender.reqText.replace('\\n', '').split('\\n');

      if (requestarray.length > 2) {
        this.preview = requestarray[0] + '<br />' + requestarray[1] + '.......<b>Read More</b>';
      } else {
        this.preview = requestarray.join('<br />');
        this.showmore = false;
      }
      this.lclrequest = requestarray.join('<br />');
    }
    this.apirfqdoc.biddoclist.asObservable().subscribe(items => {
      this.biddoclist = items;
    });
  }
  showPanel(panelname = 'quote') {
    this.panelname = panelname;
  }
  showModal(mname = 'reassign') {
    this.modalService.open(mname);
  }
  closeModal(mname = 'reassign') {
    this.modalService.close(mname);
  }
  reject() {
    const textout = (this.rejectionOnce) ? this.rejectionText + '- We want to Quote in Future' :
      this.rejectionText + '- We DO NOT want to Quote in Future';
    this.apirfqdoc.postRejection(textout).subscribe(response => {
      this.modalService.close('rejection');
      alert(response);
      this.router.navigate(['/']);
    });

  }
  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {

  }

  setAccept() {
    this.tabIndex[4] = !this.tabIndex[4];
  }
  setReject() {
    this.tabIndex[4] = false;
  }

  public tabIndexClick(index: number) {
    this.tabIndex[0] = !this.tabIndex[0];
  }
  public sendresponse(response) {
    // this.apirfqdoc.tenderLine.TAGS = this.responseform.get('response').value;

    this.apirfqdoc.postValidity(this.responseform.get('validity').value).subscribe(data2 => {
      const x = data2;
      if (response === 'commit') {
        this.apirfqdoc.postCommit('commit').subscribe(data3 => {
          const x3 = false;
          this.router.navigate(['/']);
        });
      } else {
        alert('Changes saved');
      }
    });
  }
  previewopen() {
    //  dataService.getRFQPerVendor('506452');
  }
  reloadMe() {
    const newuser = this.reassignform.value;
    const lclcontext = {
      GUID: this.tender.guid,
      EMAIL: this.apirfqdoc.currentUser.username.toLocaleUpperCase(),
      NEWMAIL: newuser.email,
      USERNAME: newuser.username,
      CELLNO: newuser.cellno
    };
    this.apirfqdoc.putReassignment(lclcontext).subscribe(data => {
      // tslint:disable-next-line:no-string-literal
      window.location.href = '/';
    });
  }
  loaddoc(files: File[]) {
    this.myFile = files[0].name;
    const reader = new FileReader();
    // const username = this..username;
    // this..chars = '';
    reader.onloadend = e => {
      const dataURL = reader.result;
      const biddocs = this.apirfqdoc.tenderdoclist.value;
      //   const contenttype = reader.result.split(',')[0];
      //   /*
      //  //dataService.createDMSDoc(im_content).then(
      //  //    function(data) {
      //  // const lclarr = data.data.ServicesList[0].JsonsetJstext.split(":") ;  */
      //   const d = new Date();
      const docno = this.tender.rfqNo;
      const vendor = this.tender.guid;
      this.apirfqdoc.uploadQuoteFile2SAP(files, dataURL, docno, vendor).subscribe(
        data => {
       const callist =    {
            MANDT: '',
            APIKEY: 'RFQQUOTE',
            DOCNO: docno,
            PARTNER: vendor,
            COUNTER: '',
            CONTENT: '',
            DATELOADED: '',
            LOADEDBY: '',
            IMPORTED: '',
            ORIGINALNAME: this.myFile,
            FILESIZE: '',
            MIMETYPE: '',
            CHARSHOLDER: ''
          };
       this.apirfqdoc.getQuoteDocs(callist).subscribe(res => {
          this.apirfqdoc.tenderdoclist.next(res.RESULT);
         });
        },
        // tslint:disable-next-line:no-shadowed-variable
        e => {
          console.log(e);
        }
      );
    };
    reader.readAsDataURL(files[0]);
  }
  /********************************************** */
  b64toBlob(b64Data, contentType, sliceSize) {
    //   contentType = contentType || '';
    //   sliceSize = sliceSize || 512;
    //   if (b64Data == 'undefined') {
    //     return;
    //   }
    //   const byteCharacters = atob(b64Data);
    //   const byteArrays = [];
    //   for (
    //     let offset = 0;
    //     offset < byteCharacters.length;
    //     offset += sliceSize
    //   ) {
    //     const slice = byteCharacters.slice(offset, offset + sliceSize);
    //     const byteNumbers = new Array(slice.length);
    //     for (const i = 0; i < slice.length; i++) {
    //       byteNumbers[i] = slice.charCodeAt(i);
    //     }
    //     const byteArray = new Uint8Array(byteNumbers);
    //     byteArrays.push(byteArray);
    //   }
    //   const blob = new Blob(byteArrays, {
    //     type: contentType
    //   });
    //   return blob;
  }
  downloaddoc(row) {
    this.apirfqdoc.getvendordoc(row);
    this.apirfqdoc.currentblob.subscribe(datain => {
      if (datain) {
        const ieEDGE = navigator.userAgent.match(/Edge/g);
        const ie = navigator.userAgent.match(/.NET/g); // IE 11+
        const oldIE = navigator.userAgent.match(/MSIE/g);
        //  				 if (ie || oldIE || ieEDGE) {
        this.filesaver.save(datain, row.ORIGINALNAME);
        this.apirfqdoc.currentblob.next(null);
      }
    });
  }
  removeDoc(rfqdoc: any) {
    this.apirfqdoc.removeBidmDoc(rfqdoc).subscribe(reply => {
      if (reply && reply.RESULT && reply.RESULT[0]) {
       this.apirfqdoc.getQuoteDocs(rfqdoc).subscribe(res => {
        this.apirfqdoc.tenderdoclist.next(res.RESULT);
       });
      }
    });
  }
}
