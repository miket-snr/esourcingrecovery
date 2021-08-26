import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RfqAPIService } from '@app/_dataservices/rfq-api.service';
import { RFQItem, RFQHeader, TenderItem } from '@app/_models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rfq-item-detail',
  templateUrl: './rfq-item-detail.component.html',
  styleUrls: ['./rfq-item-detail.component.less']
})
export class RfqItemDetailComponent implements OnInit {
  public lclRFQItem: TenderItem;
  public lclRFQItemCopy: TenderItem;
  public lclRFQItemBackup: TenderItem;
  public itemForm: FormGroup;
  public list = 'X';
  public lclDate: Date;
  subscriber: Subscription;
  @Output() closer = new EventEmitter();
  /*  Handle Documents load or download */
  submitted = false;
  vams = ['7 days', '14 days', '21 days', '28 days', '60 days', '90 days', '120 days', '180+ days'];


  constructor(private apirfq: RfqAPIService,
              private formBuilder: FormBuilder, private router: Router ) {
    this.itemForm = this.formBuilder.group({
      bidprice: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', Validators.required],
      uom: ['', Validators.required],
      validity: ['', Validators.required],
      leadtime: ['', Validators.required],
      assumption: ['', Validators.maxLength(1000)],
      rejected: [''],
      lineprice: [{calue: 0, disabled: true}]
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.itemForm.controls; }


  onReject() {
    this.itemForm.setValue({
      bidprice: 0.001,
      quantity: 0,
      uom: 'reject',
      validity: '0',
      assumption: 'Unable to Quote',
      leadtime: '0 Days',
      rejected: 'X',
      lineprice: 0
    });
    this.onSubmit();
  }
  calcLine() {
    let lclval = this.itemForm.value.quantity * this.itemForm.value.bidprice;
    lclval = (Math.floor(lclval * 100) ) / 100;
    this.itemForm.patchValue({ lineprice: lclval });
    lclval = 0;
  }
  onSubmit() {
    const tempObj = this.itemForm.value;
    this.lclRFQItemCopy.BIDPRICE = tempObj.bidprice;
    this.lclRFQItemCopy.QUANTITY = tempObj.quantity;
    this.lclRFQItemCopy.UOM = tempObj.uom;
    this.lclRFQItemCopy.VALIDITY = tempObj.validity;
    this.lclRFQItemCopy.LEADTIME = tempObj.leadtime;
    this.lclRFQItemCopy.ASSUMPTION = tempObj.assumption;
    this.lclRFQItemCopy.REJECTED = tempObj.rejected;
    this.apirfq.currentfocusItem.next(this.lclRFQItemCopy);
    this.apirfq.postPricing(this.lclRFQItemCopy);
    this.closeModal(this.lclRFQItemCopy);
  }

  ngOnInit() {
    this.apirfq.currentfocusItem.subscribe(data => {
      if (data) {
        this.lclRFQItem = data;
        this.lclRFQItemCopy = { ...data };
        if (this.lclRFQItemCopy.QUANTITY === 0) {
          this.lclRFQItemCopy.QUANTITY = 1;
        }
        if (this.lclRFQItemCopy.UOM === '') {
          this.lclRFQItemCopy.UOM = 'ea';
        }
        this.itemForm.setValue({
          bidprice: this.lclRFQItem.BIDPRICE,
          quantity: this.lclRFQItem.QUANTITY,
          uom: this.lclRFQItem.UOM,
          validity: this.lclRFQItem.VALIDITY,
          assumption: this.lclRFQItem.ASSUMPTION,
          leadtime: this.lclRFQItem.LEADTIME,
          rejected: this.lclRFQItem.REJECTED,
          lineprice: this.lclRFQItem.QUANTITY * this.lclRFQItem.BIDPRICE
        });
      }
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() { }
  ok(item) { }
  resetModal() {
    this.lclRFQItemCopy = { ...this.lclRFQItem };
  }
  closeModal(itemback) {
    this.closer.emit(itemback);
  }
}
/*  end of Handle Documents load or download */
