import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class DurationParser {
	public duration: any[] = [];

	constructor(private normalize: NormalizeService) { }
	
	getDuration(): any[] { return this.duration; }

	parse(sig: string): void {
		this.duration = [];
		this.getPatterns().forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(sig)) {
				this.duration.push({
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
			// for 3 [more] days
			pattern: new RegExp('(?:for|x)\\s*(' + regexRange + ')\\s*(?:more)?\\s*(year|month|week|day|yr\\b|mon\\b|wk\\b|d\\b)', 'ig'),
			standardize: (match: any[]) => {
				var duration = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				return {
					duration: duration[0],
					durationMax: duration[1],
					durationUnit: this.normalize.getPeriodUnit(match[2]),
				};
			}
		},
		
		// on day(s)
		// 1 | one | 1-2 | one to two | one-two
		// (a: normalize 'to' to '-', and explode)
		// if length of a > 1, then duration = a[1] - a[0]; else duration = 1
		{
			pattern: new RegExp('on day(?:s)?\\s*(' + regexRange + ')', 'ig'),
			standardize: (match: any[]) => {
				var duration = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				return {
					duration: duration.length > 1 ? duration[1] - duration[0] : 1,
					durationUnit: 'd',
				};
			}			
		}
				
		];
		
		return patterns;
	}
}

/*

Code	Display	Definition
s	second	second
min	minute	minute
h	hour	hour
d	day	day
wk	week	week
mo	month	month
a	year	year
*/