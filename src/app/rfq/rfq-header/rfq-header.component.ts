import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { RFQHeader, DMSHeader, RfqControl, Tender } from '@app/_models';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { Subscription } from 'rxjs';
import { FileSaverService } from 'ngx-filesaver';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RfqdataService } from '@app/_dataservices/rfqdata.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-rfq-header',
  templateUrl: './rfq-header.component.html',
  styleUrls: ['./rfq-header.component.less']
})
export class RfqHeaderComponent implements OnInit, OnDestroy {
  public docsload = 'UP';
  public docsdirection = 'Show Docs for Download';
  public tender: Tender;
  public lclrfqdoc: RFQHeader;
  public rfqControl: RfqControl;
  public lclrequest = '';
  public myFile: string;
  public chosendoclist: DMSHeader[];
  public hideheader = false;
  public tabIndex = new Array(true, false, false, false, false);
  responseform: FormGroup = this.fb.group({
    response: [null]
  });
  constructor(
    public apirfqdoc: RfqAPIService,
    public filesaver: FileSaverService,
    private fb: FormBuilder,
    private router: Router
  ) {


  }

  ngOnInit() {
    if (!this.apirfqdoc.currentTender){
        this.router.navigate(
          ['esourcing']) ;
    }
    this.tender = this.apirfqdoc.currentTender;
    if (this.tender.response) {
      this.responseform.setValue({
        response: this.tender.response.response ? this.tender.response.response : ''
      });
      // this.lclrfqdoc = this.tender.rfqNo;
      this.lclrequest = this.tender.reqText.replace('\\n', '').split('\\n').join('<br />');
    }

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
    this.apirfqdoc.updateRfqObj();

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
