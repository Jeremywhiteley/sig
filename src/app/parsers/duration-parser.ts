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
			pattern: new RegExp('(?:for|x)\\s*(' + regexRange + ')\\s*(year|month|week|day|yr\\b|mon\\b|wk\\b|d\\b)', 'ig'),
			standardize: (match: any[]) => {
				var duration = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				return {
					duration: duration[0],
					durationMax: duration[1],
					durationUnit: this.normalize.getPeriodUnit(match[2]),
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