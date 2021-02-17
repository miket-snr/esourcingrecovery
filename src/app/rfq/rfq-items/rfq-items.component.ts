import { Component, OnInit, OnDestroy } from '@angular/core';
import { RFQItem, TenderItem, Vendor } from '@app/_models';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { Subscription } from 'rxjs';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule, ModalService } from '@app/_modal';

/**
 *
 *
 * @export
 * @class RfqItemsComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-rfq-items',
  templateUrl: './rfq-items.component.html',
  styleUrls: ['./rfq-items.component.less']
})
export class RfqItemsComponent implements OnInit {
  public rfqItems: TenderItem[];
  public dirty: any;
  countofitems: number;
  countpages: number;
  pagesize = 5;
  paging = true;
  pageframes = [] ;
  currentpage = 1 ;
  subscriber: Subscription;
  closeResult: string;
  item: RFQItem;
  constructor(
    public rfqapi: RfqAPIService,
    public modalService: ModalService
  ) {}

  ngOnInit() {
    this.rfqItems = [];
    const pagesize = this.pagesize;
    this.countofitems = this.rfqapi.tender.tenderItems.length;
    this.paging = this.pagesize < this.countofitems ;
    for (let i = 0; i < this.pagesize && i < this.countofitems  ; i++) {
      this.rfqItems.push( this.rfqapi.tender.tenderItems[i]);
      if (i === this.countofitems ) {
        i = this.pagesize;
      }
    }

    this.countpages = Math.ceil( this.countofitems / this.pagesize );
    for (let i = 0; i < this.countpages; i++) {
       const mypage = {index: i + 1, min: i * pagesize , max: i * pagesize + pagesize - 1 };
       this.pageframes.push(mypage);
      }
    this.dirty = this.rfqapi.tender.tenderItems.reduce( ( a, b) =>
       a.BIDPRICE < b.BIDPRICE ? a : b  );
    this.rfqapi.openitems = this.dirty.BIDPRICE ;
  }
  // tslint:disable-next-line: use-lifecycle-interface
  ngOnDestroy() {

  }
  checkval(item) {
    return item.BIDPRICE <= 0 ;
  }
  pager(ind: number) {
    if (ind < 1) { ind = 1; }
    if (ind > (this.countpages + 1)) {
      ind = this.countpages + 1;
    }
    this.currentpage = ind   ;
    this.rfqItems = [];
    const cursor = (this.currentpage - 1) * this.pagesize ;
    for (let i = cursor; i < cursor + this.pagesize; i++) {

      this.rfqItems.push( this.rfqapi.tender.tenderItems[i]);
      if (i ===  (this.rfqapi.tender.tenderItems.length - 1 )) {
        i = cursor + this.pagesize;
      }
    }
  }
  openItem(item) {
    this.rfqapi.currentfocusItem.next(item);
    this.modalService.open('rfqitemedit');
  }
  open(item) {
    this.rfqapi.currentfocusItem.next(item);
    this.modalService.open('rfqitemedit');
  }
  closeModal(item: TenderItem) {
    const lclarray = [];
    if (item) {
      for (const itemin of this.rfqapi.tender.tenderItems) {
        if (itemin.ITEMNO === item.ITEMNO) {
          lclarray.push(item);
        } else {
          lclarray.push(itemin);
        }
      }
      this.rfqapi.postPricing(item) ;
      this.rfqapi.tender.tenderItems = [...lclarray];
      this.pager(this.currentpage);
      this.dirty = lclarray.reduce( ( a, b) =>
       a.BIDPRICE < b.BIDPRICE ? a : b  );
    }
    this.rfqapi.openitems = this.dirty.BIDPRICE ;
    this.modalService.close('rfqitemedit');
  }
  // updateQuote() {
  // //  this.rfqapi.updateRfqObj();
  // }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
