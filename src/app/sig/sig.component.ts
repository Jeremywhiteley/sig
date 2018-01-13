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

@Component({
  selector: 'app-sig',
  templateUrl: './sig.component.html',
  styleUrls: ['./sig.component.css']
})
export class SigComponent implements OnInit {
  sigForm: FormGroup;
  sigControl: AbstractControl;
  
  sig: string;
  frequency: Array<any>;
  dose: Array<any>;

  constructor(fb: FormBuilder) {
    this.sigForm = fb.group({
      'sigControl':  'take 1-2 tablet by mouth every 4-6 h as needed for pain'
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
	  this.frequency = new FrequencyParser(sig).frequencies;
	  this.dose = new DoseParser(sig).doses;
  }

  ngOnInit() {
   }
 
}
