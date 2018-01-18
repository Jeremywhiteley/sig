import { Component, OnInit } from '@angular/core';
import {  
  FormBuilder,  
  FormGroup, 
  FormControl,  
  Validators,  
  AbstractControl  
} from '@angular/forms';
import { FrequencyParser } from '../parsers/frequency-parser';
import { DoseParser } from '../parsers/dose-parser';
import { PrnParser } from '../parsers/prn-parser';
import { DurationParser } from '../parsers/duration-parser';

@Component({
  selector: 'app-sig',
  templateUrl: './sig.component.html',
  styleUrls: ['./sig.component.css']
})
export class SigComponent implements OnInit {
  sigForm: FormGroup;
  sigControl: AbstractControl;
  
  sig: string;
  frequency: any[] = [];
  dose: any[] = [];
  prn: any[] = [];
  duration: any[] = [];

  constructor(fb: FormBuilder) {
    this.sigForm = fb.group({
      'sigControl':  '1 tablet (10 mg) by mouth every 6 hours for 14 days as needed for nausea and vomiting'
    });

    this.sigControl = this.sigForm.controls['sigControl'];
	  
    this.sigControl.valueChanges.subscribe(
      (value: string) => {
	    this.updateSig(value);
      }
    );
	
	this.updateSig(this.sigControl.value);
  }

  	updateSig(sig: string): void {
	  this.sig = sig;
	  this.frequency = new FrequencyParser(sig).frequency;
	  this.dose = new DoseParser(sig, this.frequency).dose;
	  this.prn = new PrnParser(sig).prn;
	  this.duration = new DurationParser(sig).duration;
	  /*
	  console.log('sig frequency', this.frequency);
	  console.log('sig dose', this.dose);
	  console.log('prn', this.prn);
	  console.log('duration', this.duration);
	  */
  }

  ngOnInit() {
   }
 
}
