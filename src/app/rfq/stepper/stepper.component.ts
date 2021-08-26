import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { RFQHeader, DMSHeader, RfqControl, Tender } from '@app/_models';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { Subscription } from 'rxjs';
import { FileSaverService } from 'ngx-filesaver';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '@app/_modal';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.less']
})
export class StepperComponent implements OnInit {
  public docsload = 'UP';
  public docsdirection = 'Show Docs for Download';
  public tender: Tender;
  public lclrfqdoc: RFQHeader;
  public rfqControl: RfqControl;
  public lclrequest = '';
  public preview = '';
  public showmore = true;
  public myFile: string;
  public chosendoclist: DMSHeader[];
  public hideheader = false;
  public tabIndex = new Array(true, false, false, false, false);
  public pointer = new Array('^', '>', '>') ;

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
          ['esourcing']) ;
    }
    this.apirfqdoc.currentTender.subscribe(tenderdata => {
      this.tender = tenderdata ;
    });
    if (this.tender.response) {
      this.responseform.setValue({
        response: this.tender.response.response ? this.tender.response.response : '',
        validity: this.tender.response.validity ? this.tender.response.validity : ''
            });
      // this.lclrfqdoc = this.tender.rfqNo;
  }
    const requestarray  = this.tender.reqText.replace('\\n', '').split('\\n');

    if ( requestarray.length > 2) {
        this.preview = requestarray[0] + '<br />' + requestarray[1] + '........';
      } else {
        this.preview = requestarray.join('<br />');
        this.showmore = false;
      }
    this.lclrequest = requestarray.join('<br />');
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

  public tabClick(index: number) {
    this.tabIndex[index] = !this.tabIndex[index];
    this.pointer[index] = (this.tabIndex[index]) ? '^' : '>' ;
  }
  public sendresponse(response) {
    // this.apirfqdoc.tenderLine.TAGS = this.responseform.get('response').value;
    this.apirfqdoc.postResponse(this.responseform.get('response').value).subscribe( data => {
      this.apirfqdoc.postValidity(this.responseform.get('validity').value).subscribe( data2 => {
     const x = data2 ;
      });
    });

  }
  previewopen() {
    //  dataService.getRFQPerVendor('506452');
  }
  loaddoc(files: File[]) {
    this.myFile = files[0].name;
    const reader = new FileReader();
    // const username = this..username;
    // this..chars = '';
    reader.onloadend = e => {
      const dataURL = reader.result;
      //   const contenttype = reader.result.split(',')[0];
      //   /*
      //  //dataService.createDMSDoc(im_content).then(
      //  //    function(data) {
      //  // const lclarr = data.data.ServicesList[0].JsonsetJstext.split(":") ;  */
      //   const d = new Date();
      const vendor = this.lclrfqdoc.VENDORNO;
      const docno = this.lclrfqdoc.RFQNO;
      this.apirfqdoc.uploadQuoteFile2SAP(files, dataURL, docno, vendor);
      //     .then(function() {
      //       $location.path('/tenders');
      //     });
      //   //  }) ;
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
}
