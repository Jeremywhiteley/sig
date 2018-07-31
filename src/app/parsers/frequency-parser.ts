import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class FrequencyParser {
  public frequency: any[] = [];
  
  constructor(private normalize: NormalizeService) { }
  
  getFrequency(): any[] { return this.frequency; }
  
  parse(sig: string): void {
	this.frequency = [];
	this.patterns.forEach(p => {
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
				var f = match[1].toLowerCase();
				var repeat = {
					frequency: f == 'b' ? 2 : f == 't' ? 3 : f == 'q' ? 4 : null,
					period: 1,
					periodUnit: 'd'
				};
				return {
					repeat: repeat,
					code: {
						text: repeat.frequency + ' times per day'
					}
				}
			}
		},

		// q | every | each
		// 4 | 4-6 | 4 to 6 | four | four-six | four to six
		// hours | days | weeks | months | h | hrs | hr | min | mins | mon
		// (a: normalize 'to' to '-', and explode)
		// frequency = 1, period = a[0], periodUnit = b (normalize to h, d, wk, min), [periodMax = a[1]]
		{
		pattern: new RegExp('(?:q|every|each)\\s*\\(*\\**(' + regexRange + ')\\**\\)*\\s*(month|mon|hour|day|d\\b|week|h\\b|hrs\\b|hr\\b|min)', 'ig'),
			standardize: (match: any[]) => {
				var period = match[1].replace(/(?:to|or)/ig, '-').replace(/\s/g, '').split('-');
				var repeat = {
					frequency: 1,
					period: period[0],
					periodMax: period[1],
					periodUnit: this.normalize.getPeriodUnit(match[2])
				};

				// TODO: normalize text numbers to integer numbers
				return {
					repeat: repeat,
					code: {
						text: 'every ' + repeat.period + (repeat.periodMax ? ' to ' + repeat.periodMax : '') + ' ' + this.normalize.getPeriodUnitDisplayFromCode(repeat.periodUnit) + (repeat.period > 1 || repeat.periodMax ? 's' : '')
					}
				}
			}
		},

		// in the
		// morning | evening | afternoon
		// frequency = 1, duration = 1, when = a
		{
			pattern: new RegExp('in the\\s*(morning|evening|afternoon)', 'ig'),
			standardize: (match: any[]) => {
				var repeat = {
					frequency: 1,
					duration: 1,
					when: this.normalize.getWhen(match[1])
				};
				return {
					repeat: repeat,
					code: {
						text: 'in the ' + this.normalize.getWhenDisplayFromCode(repeat.when)
					}
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
				var repeat = {						
					frequency: 1,
					period: match[1] ? 2 : 1,
					periodUnit: this.normalize.getPeriodUnit(match[2]),
					when: this.normalize.getWhen(match[2])
				};
				return {
					repeat: repeat,
					code: {
						text: 'every ' + (repeat.period == 2 ? 'other ' : '') + (repeat.when ? this.normalize.getWhenDisplayFromCode(repeat.when) : this.normalize.getPeriodUnitDisplayFromCode(repeat.periodUnit))
					}
				}
			} 
		},
		// with | before | after
		// breakfast | lunch | dinner | meals | each meal
		// when = a + b (normalize to AC / PC / CM / etc)
		/*
		PC	http://hl7.org/fhir/v3/TimingEvent	PC	after meal (from lat. post cibus)
		PCM	http://hl7.org/fhir/v3/TimingEvent	PCM	after breakfast (from lat. post cibus matutinus)
		PCD	http://hl7.org/fhir/v3/TimingEvent	PCD	after lunch (from lat. post cibus diurnus)
		PCV	http://hl7.org/fhir/v3/TimingEvent	PCV	after dinner (from lat. post cibus vespertinus)
		*/
		{
			pattern: new RegExp('(with|\\a|\\a\\.|before|\\p|\\p\\.|after)(?: each| every)?\\s?(c\\b|c\\.\\b|meal|c\\.m\\.\\b|cm\\b|breakfast|c\\.d\\.\\b|cd\\b|lunch|c\\.v\\.\\b|cv\\b|dinner)', 'ig'),
			standardize: (match: any[]) => {
				// TODO: normalize before to 'a' and after to 'p', etc
				// TODO: normalize meals to 'm', etc
				var repeat = this.normalize.getWhen((match[1] ? match[1] : '') + (match[2] ? match[2] : ''));
				return {
					repeat: { 
						when: repeat, 
					},
					code: {
						// TODO: fix this when you fix the ac stuff above
						text: this.normalize.getWhenDisplayFromCode(repeat)
					}
				}
			}
		},

		// at
		// bedtime | night
		// frequency = 1, duration = 1, when = a (normalize to HS)
		{
			pattern: new RegExp('at\\s*(bedtime|night)', 'ig'),
			standardize: (match: any[]) => {
				return {
					repeat: {
						frequency: 1,
						duration: 1,
						when: 'HS'
					},
					code: {
						text: 'at ' + match[1]
					}
				}				
			}
		},

		// once | twice | 3-4 times
		// daily | nightly | weekly | monthly | yearly
		// once daily, twice monthly, daily
		// (a: remove 'times' or 'x')
		// frequency = a[0], frequencyMax = a[1], period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		// frequency = a (1 if once, 2 if twice, 1 if null), period = 1, periodUnit = b (normalize to d, wk, mo, yr)
		{
			pattern: new RegExp('(?:(' + regexRange + '\\s*(?:time(?:s)?|x)|once|twice)\\s*)(daily|nightly|weekly|monthly|yearly)', 'ig'),
			standardize: (match: any[]) => {
				var frequency = match[1] ? match[1].replace(/once/ig, '1').replace(/twice/ig, '2').replace(/(?:to|or)/ig, '-').replace(/(?:times|time|x)/ig, '').replace(/\s/g, '').split('-') : match[1];
				var repeat = {
					frequency: frequency ? frequency[0] : 1,
					frequencyMax: frequency[1],
					period: 1,
					periodUnit: this.normalize.getPeriodUnit(match[2]),
					when: this.normalize.getWhen(match[2])
				};
				return {
					repeat: repeat,
					code: {
						text: repeat.frequency + (repeat.frequencyMax ? ' to ' + repeat.frequencyMax : '') + ' time' + (repeat.frequency > 1 || repeat.frequencyMax ? 's' : '') + ' per ' + (repeat.when ? repeat.when : this.normalize.getPeriodUnitDisplayFromCode(repeat.periodUnit))
					}
				}
			}
		},
		
		
		// daily | nightly | weekly | monthly | yearly (exclude if anything from previous pattern precedes)
		// NOTE: this is where 'daily' and 'nightly' match
		{
			pattern: new RegExp('(?<!(?:' + regexRange + '\\s*(?:time(?:s)?|x)|once|twice)\\s*)(daily|nightly|weekly|monthly|yearly)', 'ig'),
			standardize: (match: any[]) => {
				var frequency = match[1] ? match[1].replace(/once/ig, '1').replace(/twice/ig, '2').replace(/(?:to|or)/ig, '-').replace(/(?:times|time|x)/ig, '').replace(/\s/g, '').split('-') : match[1];
				var repeat = {
					frequency: 1,
					period: 1,
					periodUnit: this.normalize.getPeriodUnit(match[1]),
					when: this.normalize.getWhen(match[2])
				};
				return {
					repeat: repeat,
					code: {
						text: '1 time per ' + (repeat.when ? repeat.when : this.normalize.getPeriodUnitDisplayFromCode(repeat.periodUnit))
					}
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
				var repeat = {
					frequency: frequency[0],
					frequencyMax: frequency[1],
					period: 1,
					periodUnit: this.normalize.getPeriodUnit(match[2])
				};		
				return {
					repeat: repeat,
					code: {
						text: repeat.frequency + (repeat.frequencyMax ? ' to ' + repeat.frequencyMax : '') + ' time' + (repeat.frequency > 1 || repeat.frequencyMax ? 's' : '') + ' per ' + this.normalize.getPeriodUnitDisplayFromCode(repeat.periodUnit)
					}
				}
			}
		},
				
		// x1 | x 1
		// exclude if followed by: day | week | month
		// count = 1
		{
			pattern: new RegExp('(?:x\\s*1\\b(?!day| day|d\\b| d\\b|week| week|w\\b| w\\b|month| month|mon|m\\b| m\\b| mon\\b)|one time only)', 'ig'),
			standardize: (match: any[]) => {
				return {
					repeat: {
						count: 1
					},
					code: {
						text: 'once'
					}
				}
			}
		},

		// every | on
		// Thursday
		// Monday, Tuesday, Wednesday, and Friday
		// dayOfWeek = a
		{
			pattern: new RegExp('(?:every|on|q)\\s+((?:(?:\\s*(?:and|&|\\+|,)\\s*)*(?:' + regexDaysOfWeek + '))+)', 'ig'),
			standardize: (match: any[]) => {
				var day = match[1].replace(/(?:\s*(?:and|&|\+|,)\s*)+/ig, '|').split('|').map(d => this.normalize.getDayOfWeek(d));
				
				return {
					repeat: {
						dayOfWeek: day
					},
					code: {
						text: 'every ' + day.join(', ')
					}
				}
			}
		},
		
		// as directed
		{
			pattern: new RegExp('as directed', 'ig'),
			standardize: (match: any[]) => {				
				return {
					code: {
						text: 'as directed'
					}
				}
			}
		}
		
		];		

		return patterns;
  }
  
  /*
	Improvements:
	What about "at 8am" timings of meds?
  */
  
  private patterns: any[] = this.getPatterns();
}