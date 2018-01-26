import { Injectable } from '@angular/core';

@Injectable()
export class NormalizeService {

	private regexOneToTwentyfour: string = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twentyone|twenty one|twenty-one|twentytwo|twenty two|twenty-two|twentythree|twenty three|twenty-three|twentyfour|twenty four|twenty-four';
	// NOTE: keep the x-y at the beginning and x at the end so that it finds the x-y first without stopping
	private regexRange: string = '(?:(?:' + this.regexOneToTwentyfour + '|(?:(?:\\d+\\s*)*(?:\\.|/|,))?\\d+)\\s*(?:to|-|or)\\s*(?:' + this.regexOneToTwentyfour + '|(?:(?:\\d+\\s*)*(?:\\.|/|,))?\\d+)|(?:(?:\\d+\\s*)*(?:\\.|/|,))?\\d+|(?:' + this.regexOneToTwentyfour + '))';

	private regexDaysOfWeek: string = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon\\b|tue\\b|tues\\b|wed\\b|thu\\b|thur\\b|thurs\\b|fri\\b|sat\\b|sun\\b|m\\b|tu\\b|w\\b|th\\b|t\\b|f\\b|sa\\b|su\\b|s\\b';
	
	private when: any[] = [
		{ standard: 'morn', synonyms: [ 'morning', 'morn', 'am', 'a.m.' ] },
		{ standard: 'aft', synonyms: [ 'afternoon', 'aft', 'pm', 'p.m.' ] },
		{ standard: 'eve', synonyms: [ 'evening', 'eve' ] },
		{ standard: 'night', synonyms: [ 'night', 'hs', 'h.s.' ] }				
	];

	// NOTE: periodUnit day should include pretty much all of when
	private periodUnit: any[] = [
		{ standard: 'min', synonyms: [ 'minutes', 'minute', 'mins', 'min' ] },
		{ standard: 'h', synonyms: [ 'hours', 'hour', 'hrs', 'hr', 'h' ] },
		{ standard: 'd', synonyms: [ 'days', 'day', 'd', 'morning', 'morn', 'am', 'a.m.', 'afternoon', 'aft', 'pm', 'p.m.', 'evening', 'eve', 'night', 'hs', 'h.s.' ] },
		{ standard: 'wk', synonyms: [ 'weeks', 'week', 'wk', 'w' ] },
		{ standard: 'mo', synonyms: [ 'months', 'month', 'mon', 'mo' ] },
		{ standard: 'yr', synonyms: [ 'years', 'year', 'yr', 'y' ] }				
	];

	constructor() { }
	
	getRegexRange() { return this.regexRange; }
	
	getRegexDaysOfWeek() { return this.regexDaysOfWeek; }
	
	getStandard(o: any[], s: string) {
		var r = o.find(r => r.synonyms.indexOf(s) > -1);
		return r ? r.standard : r;		
	}

	getWhen(s: string) {
		return this.getStandard(this.when, s);
	}
	
	getPeriodUnit(s: string) {
		return this.getStandard(this.periodUnit, s);
	}
}
