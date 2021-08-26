import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
// import { DataApiService } from '/src/app/_dataservices/data-api.service';
import { RFQHeader, RFQItem, Tender, TenderItem } from '@app/_models';
import { RfqAPIService } from 'src/app/_dataservices/rfq-api.service';
import { build$ } from 'protractor/built/element';
import { ModalService } from '@app/_modal';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-imgtopdf',
  templateUrl: './imgtopdf.component.html',
  styleUrls: ['./imgtopdf.component.less']
})
export class ImgtopdfComponent implements OnInit {
  public chosenrfq: Tender;
  public rfqItems: TenderItem[];
  public arrayOfArrays = [];
  public pdf: jspdf;
  arrayBuffer: ArrayBuffer ;
  constructor(private apirfqdoc: RfqAPIService, private modalService: ModalService) {


  }

  ngOnInit() {

    this.apirfqdoc.currentTender.subscribe(tenderdata => {
      if (tenderdata) {
        this.chosenrfq = tenderdata;
        const size = 20;
        this.arrayOfArrays = [];
        for (let i = 0; i < tenderdata.tenderItems.length; i += size) {
          this.arrayOfArrays.push(tenderdata.tenderItems.slice(i, i + size));
        }
        this.rfqItems = this.arrayOfArrays;
      }
    });
  }
  checkval() {

  }
  openItem(item) {
    this.apirfqdoc.currentfocusItem.next(item);
    this.modalService.open('itemeditpdf');
  }
  closeModal(item: TenderItem) {
    const lclarray = [];
    if (item) {
      for (const itemin of this.chosenrfq.tenderItems) {
        if (itemin.ITEMNO === item.ITEMNO) {
          lclarray.push(item);
        } else {
          lclarray.push(itemin);
        }
      }
      //    this.apirfqdoc.postPricing(item) ;
      this.chosenrfq.tenderItems = [...lclarray];
      this.apirfqdoc.tender.next(this.chosenrfq);
    }
    //   this.modalService.close('itemeditpdf');
  }
  exportCSV() {
    const data = [];
    const temp = '"Itemno","Material","Description","Quantity","Uom","Lead Time","Validity Period","Unit Price","Comment"';
    data.push(temp);
    this.arrayOfArrays[0].forEach(element => {
      let mystr = (element.ITEMNO.toString() || ' ') + ',';
      mystr = mystr + (element.MATERIAL || ' ') + ',';
      mystr = mystr + (element.MTEXT || ' ') + ',';
      mystr = mystr + (element.QUANTITY || 1).toString() + ',';
      mystr = mystr + (element.UOM || 'ea') + ',';
      mystr = mystr + (element.LEADTIME || ' ') + ',';
      mystr = mystr + (element.VALIDITY || ' ') + ',';
      mystr = mystr + + (element.BIDPRICE || 0).toFixed(2) + ',';
      mystr = mystr + (element.ASSUMPTION || ' ') ;
      data.push(mystr);
    });
    const csvArray = data.join('\r\n');
    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = 'Bidvest Tender' + this.chosenrfq.rfqNo + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

  }

  importCSV() {

  }

addFile( event) {
  const file = event.target.files[0];
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result as ArrayBuffer ;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
      }
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, {type: 'binary'});
      const firstsheetname = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstsheetname];
      console.log(XLSX.utils.sheet_to_json(worksheet, {raw: true}));

};
}


  public captureScreen(coder: number) {

    this.pdf = new jspdf('landscape', 'mm', 'a4');
    const data = document.getElementById('header');
    html2canvas(data, {
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(canvas => {
      // Few necessary setting options
      const imgWidth = 200;
      // const pageHeight = document.getElementById(pageno).scrollHeight;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;
      const contentDataURL = canvas.toDataURL('image/png');
      this.pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, 36);
      this.buildPagetext();
      if ( coder === 2 ) {
      this.sendToSAP();
      }
      this.pdf.save('Bidvest Tender' + this.chosenrfq.rfqNo + '.pdf');
    });

    /* [
      document.getElementById('Page0').scrollWidth,
      document.getElementById('Page0').scrollHeight
    ]); // A4 size page of PDF*/
    // let index = 0;
    // while (index <= this.arrayOfArrays.length) {
    // this.buildPage(0);
    //   index++;
    // }
  }
  public buildPagetext() {
    let indexY = 40;
    this.pdf.setFontSize(11);
    this.pdf.setFont('times');
    this.pdf.setFontType('bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('times');
    this.pdf.setFontSize(10);
    this.pdf.text(10, indexY, 'Item');
    this.pdf.text(20, indexY, 'Material');
    this.pdf.text(35, indexY, 'Description');
    this.pdf.text(105, indexY, 'Quantity');
    this.pdf.text(125, indexY, 'Uom');
    this.pdf.text(135, indexY, 'Lead-time');
    this.pdf.text(165, indexY, 'Validity');
    this.pdf.text(195, indexY, 'Bid Price');
    this.pdf.text(210, indexY, 'Comment / Assumption');
    indexY = indexY + 4;
    this.pdf.setFontType('normal');
    this.arrayOfArrays[0].forEach(element => {
      this.pdf.setFont('times');
      this.pdf.setFontSize(10);
      this.pdf.text(10, indexY, element.ITEMNO.toString());
      this.pdf.text(20, indexY, (element.MATERIAL || ' '));
      this.pdf.text(35, indexY, (element.MTEXT || ' '));
      this.pdf.text(112, indexY, (element.QUANTITY || 1).toString());
      this.pdf.text(125, indexY, (element.UOM || 'ea'));
      this.pdf.text(135, indexY, (element.LEADTIME || ' '));
      this.pdf.text(165, indexY, (element.VALIDITY || ' '));
      this.pdf.setFont('courier');
      const tstr = '                    ' + (element.BIDPRICE || 0).toFixed(2);
      this.pdf.text(185, indexY, tstr.substr(tstr.length - 10));
      this.pdf.setFont('times');
      this.pdf.text(210, indexY, (element.ASSUMPTION || ' '));
      indexY = indexY + 4;
    });
  }
  // const indexStr = 'Page' + index ;
  // const imgObject = [{contentDataURL: '', imgWidth: 0, imgHeight: 0}];
  // await imgObject.push( this.buildPage(indexStr).then(datax => {

  public buildPage(index: number) {
    const pageno = 'Page' + index;
    if (index > 0) {

      this.pdf.addPage();
    }
    const data = document.getElementById(pageno);
    html2canvas(data, {
      scrollX: 0,
      scrollY: -window.scrollY
    }).then(canvas => {
      // Few necessary setting options
      const imgWidth = 800;
      const pageHeight = document.getElementById(pageno).scrollHeight;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const heightLeft = imgHeight;
      const contentDataURL = canvas.toDataURL('image/png');

      if (index === 0) {
        this.pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
        this.pdf.save('Random.pdf'); // Generated PDF
      }
    });
  }

  private sendToSAP() {
    //   const reader = new FileReader();
    const docno = this.chosenrfq.rfqNo;
    const vendor = this.chosenrfq.guid;
    const files = [{ name: 'FinalQuote.pdf', size: 1234, type: 'application/pdf' }];
    const dataURL = btoa(this.pdf.output());
    const sizeme = this.pdf.output().length;
    dataURL.trim();
    // reader.readAsDataURL(this.pdf.output('blob'));
    // reader.onloadend = e => {
    //   let dataURL: any;
    //   dataURL = reader.result;
    files[0].size = sizeme;
    this.apirfqdoc.uploadQuoteFile2SAP(files, dataURL, docno, vendor);
    // };
  }
}
