import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class FrequencyParser {
  public frequency: any[] = [];
  
  constructor(private normalize: NormalizeService) { }
  
  getFrequency(): any[] { return this.frequency; }
  
  parse(sig: string): void {
	this.frequency = [];
	this.getPatterns().forEach(p => {
		var match: any[] = [];
		while (match = p.pattern.exec(sig)) {
			this.frequency.push({
				match: match,
				standardized: p.standardize(match)
			});
		}
	});
  }
  
  getPatterns(): any[] {
		var regexRange = this.normalize.getRegexRange();
		var regexDaysOfWeek = this.normalize.getRegexDaysOfWeek();

		var patterns: any[] = [
		// bid | tid | qid
		// bid-tid
		// frequency = a (2 if b, 3 if t, 4 if q), period = 1, periodUnit = d
		{ 
			pattern: new RegExp('(?:(?:\\s*(?:to|-|or)\\s*)?(b|t|q)\\.?i\\.?d\\b\\.?)+', 'ig'),
			standardize: (match: any[]) => {
				return {
					frequency: match[1] == 'b' ? 2 : match[1] == 't' ? 3 : match[1] == 'q' ? 4 : null,
					period: 1,
					periodUnit: 'd'
				}
			}
		},

		// q | every | each
		// 4 | 4-6 | 4 to 6 | four | four-six | four to six
		// hours | days | weeks | h | hrs | hr | min | mins
		// (a: normalize 'to' to '-', and explode)
		// frequency = 1, period = a[0], periodUnit = b (normalize to h, d, wk, min), [periodMax = a[1]]
		{
			pattern: new RegExp('(?:q|every|each)\\s*\\(*\\**(' + regexRange + ')\\**\\)*\\s*(hours|days|weeks|h\\b|hrs\\b|hr\\b|min|mins)', 'ig'),
			standardize: (match: any[]) => {
				var period = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				// TODO: normalize text numbers to integer numbers
				return {
					frequency: 1,
					period: period[0],
					periodUnit: this.normalize.getPeriodUnit(match[2]),
					periodMax: period[1] ? period[1] : null
				}
			}
		},
		// qam | qpm | qhs | qday | qdaily
		// frequency = 1, period = 1, periodUnit = d, [when = a (normalize to MORN, AFT, EVE]
		/* NOTE: this is likely duplicate of the pattern two patterns below
		{
			pattern: new RegExp('q\\.?\\s*(a\\.?m\\.?|p\\.?m\\.?|h\\.?s\\.?|day|daily)', 'ig'),
			standardize: (match: any[]) => {
				return {
					frequency: 1,
					period: 1,
					periodUnit: 'd',
					when: this.normalize.getWhen(match[1])
				}
			}
		},
		*/

		// in the
		// morning | evening | afternoon
		// frequency = 1, duration = 1, when = a
		{
			pattern: new RegExp('in the\\s*(morning|evening|afternoon)', 'ig'),
			standardize: (match: any[]) => {
				return {
					frequency: 1,
					duration: 1,
					when: this.normalize.getWhen(match[1])
				}
			}
		},
		
		// every | each
		// [other]
		// day | week | month | morning | afternoon | evening | night | hs
		// TODO: combine with the qpm/qhs/qday/qdaily group above
		// frequency = 1, period = 1 (or 2 if a is not null), periodUnit = b (normalize to d, wk, mo), [when = b (normalize to MORN, AFT, EVE, etc]
		{
			pattern: new RegExp('(?:every|each|q)\\s*(other\\b|o\\b)?\\s*(day|week|month|morning|afternoon|evening|night|hs\\b|h.s.\\b|p.m.\\b|pm\\b|d\\b)', 'ig'),
			standardize: (match: any[]) => {
				return {
					frequency: 1,
					period: match[1] ? 2 : 1,
					periodUnit: this.normalize.getPeriodUnit(match[2]),
					when: this.normalize.getWhen(match[2])
				}
			} 
		},
		// with | before | after
		// breakfast | lunch | dinner | meals | each meal
		// when = a + b (normalize to AC / PC / CM / etc)
		{
			pattern: new RegExp('(with|before|after)\\s*(breakfast|lunch|dinner|meals|each meal)', 'ig'),
			standardize: (match: any[]) => {
				// TODO: normalize before to 'a' and after to 'p', etc
				// TODO: normalize meals to 'm', etc
				return { when: match[1] + match [2] }
			}
		},

		// at
		// bedtime | night
		// frequency = 1, duration = 1, when = a (normalize to HS)
		{
			pattern: new RegExp('at\\s*(bedtime|night)', 'ig'),
			standardize: (match: any[]) => {
				return {
					frequency: 1,
					duration: 1,
					when: 'HS'
				}				
			}
		},

		// [once | twice]
		// daily | nightly | weekly | monthly | yearly
		// once daily, twice monthly, daily
		// (a: remove 'times' or 'x')
		// frequency = a[0], frequencyMax = a[1], period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// frequency = a (1 if once, 2 if twice, 1 if null), period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// NOTE: this is where 'daily' and 'nightly' match
		{
			pattern: new RegExp('(?:(' + regexRange + '\\s*(?:time(?:s)|x)|once|twice)\\s*)?(daily|nightly|weekly|monthly|yearly)', 'ig'),
			standardize: (match: any[]) => {
				var frequency = match[1] ? match[1].replace(/once/ig, '1').replace(/twice/ig, '2').replace(/(?:to|or)/ig, '-').replace(/(?:times|time|x)/ig, '').replace(/\s/g, '').split('-') : match[1];
				// ISSUE: three to four times daily comes across as only four times daily
				return {
					frequency: frequency ? frequency[0] : 1,
					frequencyMax: frequency ? frequency[1] : null,
					period: 1,
					periodUnit: this.normalize.getPeriodUnit(match[2]),
				}
			}
		},
		
		// 4 | four | 4-6 | 4 to 6 | 4 or 6 | four-six | four to six | four or six
		// time(s) | x
		// [per | a | each | /]
		// day | daily | week | weekly | month | monthly
		// 2-3 times daily
		// (a: remove 'times' or 'x', normalize 'to' to '-', and explode)
		// frequency = a[0], frequencyMax = a[1], period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// frequency = a (1 if once, 2 if twice), period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// NOTE: 'daily' won't match this pattern
		{
			pattern: new RegExp('(' + regexRange + '\\s*(?:time(?:s)|x|nights|days)|once|twice)\\s*(?:per|a|each|\/)\\s*(day|week|month|year|d\\b|w\\b|mon|m\\b|yr\\b)', 'ig'),
			standardize: (match: any[]) => {
				var frequency = match[1].replace(/once/ig, '1').replace(/twice/ig, '2').replace(/(?:to|or)/ig, '-').replace(/(?:times|time|x|nights|days)/ig, '').replace(/\s/g, '').split('-');
				
				// ISSUE: three to four times a day comes across as only four times a day
				return {
					frequency: frequency[0],
					frequencyMax: frequency[1],
					period: 1,
					periodUnit: this.normalize.getPeriodUnit(match[2]),
				}
			}
		},
				
		// x1 | x 1
		// exclude if followed by: day | week | month
		// count = 1
		{
			pattern: new RegExp('(?:x\\s*1\\b(?!(?:day| day|d\\b| d\\b|week| week|w\\b| w\\b|month| month|mon|m\\b| m\\b| mon\\b))|one time only)', 'ig'),
			standardize: (match: any[]) => {
				return {
					count: 1
				}
			}
		},

		// every | on
		// Thursday
		// Monday, Tuesday, Wednesday, and Friday
		// dayOfWeek = a
		// ISSUE: only captures last day of multiple days (i.e. will only capture Friday for Monday, Wednesday, and Friday)
		{
			pattern: new RegExp('(?:every|on|q)\\s+((?:(?:\\s*(?:and|&|\\+|,)\\s*)*(?:' + regexDaysOfWeek + '))+)', 'ig'),
			standardize: (match: any[]) => {
				var day = match[1].replace(/(?:\s*(?:and|&|\+|,)\s*)+/ig, '|').split('|').map(d => this.normalize.getDayOfWeek(d));
				
				return {
					dayOfWeek: day
				}
			}
		},
		
		];		

		return patterns;
  }
}