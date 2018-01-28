import { Injectable } from '@angular/core';

import { NormalizeService } from '../services/normalize.service';
import { FrequencyParser } from '../parsers/frequency-parser';
import { DoseParser } from '../parsers/dose-parser';
import { RouteParser } from '../parsers/route-parser';
import { DurationParser } from '../parsers/duration-parser';
import { IndicationParser } from '../parsers/indication-parser';
import { MethodParser } from '../parsers/method-parser';

@Injectable()
export class SigParser {
	public sig: any[] = [];

	constructor(
			private normalize: NormalizeService, 
			private frequencyParser: FrequencyParser,
			private routeParser: RouteParser,
			private doseParser: DoseParser,
			private indicationParser: IndicationParser,
			private durationParser: DurationParser,
			private methodParser: MethodParser
		) {	}
	
	getSig(): any { return this.sig; }

	parse(sig: string): void {
		this.sig = [];
		var sigs: string[] = this.splitSig(sig);
		
		sigs.forEach((s, i) => {				
			this.frequencyParser.parse(s);
			this.routeParser.parse(s);
			this.doseParser.parse(s);
			this.durationParser.parse(s);
			this.indicationParser.parse(s);
			this.methodParser.parse(s);

			this.sig.push({
				text: s,
				sequence: i,
				frequency: this.frequencyParser.getFrequency(),
				route: this.routeParser.getRoute(),
				dose: this.doseParser.getDose(),
				duration: this.durationParser.getDuration(),
				indication: this.indicationParser.getIndication(),
				method: this.methodParser.getMethod()
			});			
		});

		console.log('sig', this.sig);
	}

	// split sig by 'then' occurrences
	splitSig(sig: string): string[] {
		var sigs: string[] = [];
		
		var pattern = new RegExp('\\s*(?:,|\\.)?\\s*then\\s*', 'ig');

		var split: any[] = [];
		var match: any;
		while (match = pattern.exec(sig)) { split.push(match); }		
		
		if (split.length > 0) {
			var index: number = 0;
			split.forEach((s, i) => {
				sigs.push(sig.substring(index, s.index));
				index = s.index;
				if (i = split.length) sigs.push(sig.substring(index));
			})
		} else {
			sigs.push(sig);
		}

		return sigs;
	}
}