import { Component, OnInit } from '@angular/core';
import {  
  FormBuilder,  
  FormGroup, 
  FormControl,  
  Validators,  
  AbstractControl  
} from '@angular/forms';

import { SigParser } from '../parsers/sig-parser';
import { FrequencyParser } from '../parsers/frequency-parser';
import { DoseParser } from '../parsers/dose-parser';
import { RouteParser } from '../parsers/route-parser';
import { DurationParser } from '../parsers/duration-parser';
import { IndicationParser } from '../parsers/indication-parser';
import { MethodParser } from '../parsers/method-parser';

@Component({
  selector: 'app-sig',
  templateUrl: './sig.component.html',
  styleUrls: ['./sig.component.css'],
  providers: [
	SigParser,
	FrequencyParser,
	DoseParser,
	RouteParser,
	DurationParser,
	IndicationParser,
	MethodParser
  ]
})
export class SigComponent implements OnInit {
  sigForm: FormGroup;
  sigControl: AbstractControl;
  
  sigString: string;
  sig: any[] = [];

  constructor(
		private fb: FormBuilder,
		private sigParser: SigParser
  ) {
    this.sigForm = fb.group({
      'sigControl':  '2 po on day 1 ; then one po daily x 4 days, then 1 daily for 3 days'
	  /* weird sigs to figure out:
	  Take 2 tablets on day 1 and 1 tablet on days 2-5 (tricky part is the 'and')
	  3 tabs p.o. x 1 with food on day 1. Thereafter, 1 tab p.o. t.i.d. with food to complete a 5 day course (tricky part is the 5 day course, and 'thereafter')
	  
	  */
    });

    this.sigControl = this.sigForm.controls['sigControl'];
	  
    this.sigControl.valueChanges.subscribe(
      (value: string) => {
		this.sigString = value;
	    this.sigParser.parse(this.sigString);
		this.sig = this.sigParser.getSig();
      }
    );
	
	this.sigString = this.sigControl.value;
	this.sigParser.parse(this.sigString);
	this.sig = this.sigParser.getSig();
  }

  ngOnInit() { } 
}