import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class MethodParser {
	public method: any[] = [];

	constructor(private normalize: NormalizeService) { }
	
	getMethod(): any[] { return this.method; }

	parse(sig: string): void {
		this.method = [];
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(sig)) {
				this.method.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		});
	}

	getPatterns(): any[] {
		var patterns: any[] = [];
		
		this.methods.map(m => {
			patterns.push({
				pattern: new RegExp('(' + m.display + ')', 'ig'),
				standardize: (match: any[]) => {
					return {
						coding: {
							//system: 'http://snomed.info/sct',
							code: m.code,
							display: m.display
						},
						text: m.display
					}
				}
			});
		});
		
		return patterns;
	}
	
	private methods: any[] = [
		{ code: 417924000, display: 'apply'	},
		{ code: 418283001, display: 'administer' },
		{ code: 419385000, display: 'use' },
		{ code: 419582001, display: 'give' },
		{ code: 419652001, display: 'take' },
		{ code: 419747000, display: 'chew' },
		{ code: 422145002, display: 'inject' },

		
		{ code: 421067001, display: 'then' }
	];
}

/*
https://www.hl7.org/fhir/valueset-administration-method-codes.html

Code	Display	Definition
417924000 	Apply	
418283001 	Administer	
419385000 	Use	
419582001 	Give	
419652001 	Take	
419747000 	Chew	
420045007 	Suck	
420246001 	At	
420247005 	Dosing instruction imperative	
420295001 	Only	
420341009 	Constant	
420360002 	Sniff	
420484009 	Subtract - dosing instruction fragment	
420503003 	As	
420561004 	Or	
420604000 	Finish	
420606003 	Shampoo	
420620005 	Push	
420652005 	Until gone	
420771004 	Upon	
420806001 	Per	
420883007 	Sparingly	
420942008 	Call	
420974001 	When	
421035004 	To	
421066005 	Place	
421067001 	Then	
421134003 	Inhale	
421139008 	Hold	
421206002 	Multiply	
421257003 	Insert	
421286000 	Discontinue	
421298005 	Swish and swallow	
421399004 	Dilute	
421463005 	With	
421484000 	Then discontinue	
421521009 	Swallow	
421538008 	Instill	
421548005 	Until	
421612001 	Every	
421682005 	Dissolve	
421718005 	Before	
421723005 	Now	
421769005 	Follow directions	
421803000 	If	
421805007 	Swish	
421829000 	And	
421832002 	Twice	
421939007 	Follow	
421984009 	Until finished	
421994004 	During	
422033008 	Divide	
422106007 	Add	
422114001 	Once	
422145002 	Inject	
422152000 	Wash	
422219000 	Sprinkle	
422327006 	Then stop	
*/