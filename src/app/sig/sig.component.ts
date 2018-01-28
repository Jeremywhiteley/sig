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
import { RouteParser } from '../parsers/route-parser';
import { DurationParser } from '../parsers/duration-parser';
import { IndicationParser } from '../parsers/indication-parser';
import { MethodParser } from '../parsers/method-parser';

@Component({
  selector: 'app-sig',
  templateUrl: './sig.component.html',
  styleUrls: ['./sig.component.css'],
  providers: [
	FrequencyParser,
	RouteParser,
	DoseParser,
	IndicationParser,
	DurationParser,
	MethodParser
  ]
})
export class SigComponent implements OnInit {
  sigForm: FormGroup;
  sigControl: AbstractControl;
  
  sig: string;
  frequency: any[] = [];
  route: any[] = [];
  dose: any[] = [];
  indication: any[] = [];
  duration: any[] = [];
  method: any[] = [];

  constructor(
			private fb: FormBuilder,
			private frequencyParser: FrequencyParser,
			private routeParser: RouteParser,
			private doseParser: DoseParser,
			private indicationParser: IndicationParser,
			private durationParser: DurationParser,
			private methodParser: MethodParser
		) {
    this.sigForm = fb.group({
      'sigControl':  '0.5 grams per vagina 2 nights per week (every Monday, Wednesday, and Thursday)'
	  /* weird sigs to figure out:
	  Take 2 tablets on day 1 and 1 tablet on days 2-5 (tricky part is the 'and')
	  3 tabs p.o. x 1 with food on day 1. Thereafter, 1 tab p.o. t.i.d. with food to complete a 5 day course (tricky part is the 5 day course, and 'thereafter')
	  
	  */
    });

    this.sigControl = this.sigForm.controls['sigControl'];
	  
    this.sigControl.valueChanges.subscribe(
      (value: string) => {
		this.sig = value;
	    this.parseSig();
      }
    );
	
	this.sig = this.sigControl.value;
	this.parseSig();
  }

  parseSig(): void {
	 this.frequencyParser.parse(this.sig);
	 this.routeParser.parse(this.sig);
	 this.doseParser.parse(this.sig);
	 this.durationParser.parse(this.sig);
	 this.indicationParser.parse(this.sig);
	 this.methodParser.parse(this.sig);
	 
	 this.frequency = this.frequencyParser.getFrequency();
	 this.route = this.routeParser.getRoute();
	 this.dose = this.doseParser.getDose();
	 this.duration = this.durationParser.getDuration();
	 this.indication = this.indicationParser.getIndication();
	 this.method = this.methodParser.getMethod();
  }

  ngOnInit() { } 
}