import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class IndicationParser {
	public indication: any[] = [];

	constructor(private normalize: NormalizeService) { }
	
	getIndication(): any[] { return this.indication; }

	parse(sig: string): void {
		this.indication = [];
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(sig)) {
				this.indication.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		});
	}

	getPatterns(): any[] {
		var regexRange = this.normalize.getRegexRange();

		var patterns: any[] = [
		{
			// as needed for pain | prn for pain | p.r.n. pain | prn pain
			// asNeededBoolean = true
			pattern: new RegExp('(?:as needed for|as needed|p.r.n. for|prn for|p.r.n.|prn)\\s*((?:\\w|\\s*)*)', 'ig'),
			standardize: (match: any[]) => {
				var reasons = match[1] ? match[1].split(' ') : null;
				// TODO: match each word against a database of diagnoses (ICD-10 / UMLS?)
				// https://documentation.uts.nlm.nih.gov/rest/search/
				if (reasons) { 
					var indicationWords: string[] = [];
					var indicationSearch: string = '';
					reasons.forEach(r => {
						indicationWords.push(r);
						indicationSearch = indicationWords.join(' ');
						// TODO do a UMLS search with the indicationSearch keyword, each time
						// adding it to an array of search results, afterwards selecting the
						// best match. Maybe limit to 5 words?
					});
				}
				return {
					asNeededBoolean: true,
					asNeededCodeableConcept: reasons
				}
			}
		},
		/* NOTE: Dosage does not capture indication unless it is a PRN indication
		NOTE: this should be "reasonCode"
		{	
			// for nausea and vomiting (exclude prn before 'for', and exclude numbers immediately after 'for')
			// asNeededBoolean = false
			pattern: new RegExp('(?<!(?:as needed|p.r.n.|prn)\\s*)(?:for\\s+(?!(?:' + regexRange + '))((?:\\w|\\s)+))', 'ig'),
			standardize: (match: any[]) => {
				var reasons = match[1] ? match[1].split(' ') : null;
				// TODO: match each word against a database of diagnoses (ICD-10 / UMLS?)
				// https://documentation.uts.nlm.nih.gov/rest/search/
				if (reasons) { 
					var indicationWords: string[] = [];
					var indicationSearch: string = '';
					reasons.forEach(r => {
						indicationWords.push(r);
						indicationSearch = indicationWords.join(' ');
						console.log(indicationSearch);
						// TODO do a UMLS search with the indicationSearch keyword, each time
						// adding it to an array of search results, afterwards selecting the
						// best match. Maybe limit to 5 words?
					});
				}
				return {
					reasonCode: reasons
				}
			}
		}
		*/
		];
		
		return patterns;
	}
}