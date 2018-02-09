import { Injectable } from '@angular/core';

@Injectable()
export class NormalizeService {

	private regexOneToTwentyfour: string = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twentyone|twenty one|twenty-one|twentytwo|twenty two|twenty-two|twentythree|twenty three|twenty-three|twentyfour|twenty four|twenty-four';
	// NOTE: keep the x-y at the beginning and x at the end so that it finds the x-y first without stopping
	private regexRange: string = '(?:(?:' + this.regexOneToTwentyfour + '|(?:(?:\\d+\\s*)*(?:\\.|/|,))?\\d+)\\s*(?:to|-|or)\\s*(?:' + this.regexOneToTwentyfour + '|(?:(?:\\d+\\s*)*(?:\\.|/|,))?\\d+)|(?:(?:\\d+\\s*)*(?:\\.|/|,))?\\d+|(?:' + this.regexOneToTwentyfour + '))';
	
	private regexDaysOfWeek: string = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon\\b|tue\\b|tues\\b|wed\\b|thu\\b|thur\\b|thurs\\b|fri\\b|sat\\b|sun\\b|m\\b|tu\\b|w\\b|th\\b|t\\b|f\\b|sa\\b|su\\b|s\\b';
	
	/* https://www.hl7.org/fhir/valueset-days-of-week.html
	Code	Display	Definition
	mon	Monday	Monday
	tue	Tuesday	Tuesday
	wed	Wednesday	Wednesday
	thu	Thursday	Thursday
	fri	Friday	Friday
	sat	Saturday	Saturday
	sun	Sunday	Sunday
	*/	
	private dayOfWeek: any[] = [
		{ code: 'mon', display: 'monday', synonyms: [ 'monday', 'mon', 'mo', 'm' ] },
		{ code: 'tue', display: 'tuesday', synonyms: [ 'tuesday', 'tues', 'tue', 'tu' ] },
		{ code: 'wed', display: 'wednesday', synonyms: [ 'wednesday', 'weds', 'wed', 'wd', 'w' ] },
		{ code: 'thu', display: 'thursday', synonyms: [ 'thursday', 'thurs', 'thu', 'th' ] },
		{ code: 'fri', display: 'friday', synonyms: [ 'friday', 'fri', 'fr', 'f' ] },
		{ code: 'sat', display: 'saturday', synonyms: [ 'saturday', 'sat', 'sa' ] },
		{ code: 'sun', display: 'sunday', synonyms: [ 'sunday', 'sun', 'su' ] }
	];
	
	// TODO: make all of the ac / pc / hs / etc
	/* https://www.hl7.org/fhir/valueset-event-timing.html
	Code	System	Display	Definition
	MORN	http://hl7.org/fhir/event-timing	Morning	event occurs during the morning
	AFT	http://hl7.org/fhir/event-timing	Afternoon	event occurs during the afternoon
	EVE	http://hl7.org/fhir/event-timing	Evening	event occurs during the evening
	NIGHT	http://hl7.org/fhir/event-timing	Night	event occurs during the night
	PHS	http://hl7.org/fhir/event-timing	After Sleep	event occurs [offset] after subject goes to sleep
	HS	http://hl7.org/fhir/v3/TimingEvent	HS	Description: Prior to beginning a regular period of extended sleep (this would exclude naps). Note that this might occur at different times of day depending on a person's regular sleep schedule.
	WAKE	http://hl7.org/fhir/v3/TimingEvent	WAKE	Description: Upon waking up from a regular period of sleep, in order to start regular activities (this would exclude waking up from a nap or temporarily waking up during a period of sleep) Usage Notes: e.g. Take pulse rate on waking in management of thyrotoxicosis. Take BP on waking in management of hypertension Take basal body temperature on waking in establishing date of ovulation
	C	http://hl7.org/fhir/v3/TimingEvent	C	Description: meal (from lat. ante cibus)
	CM	http://hl7.org/fhir/v3/TimingEvent	CM	Description: breakfast (from lat. cibus matutinus)
	CD	http://hl7.org/fhir/v3/TimingEvent	CD	Description: lunch (from lat. cibus diurnus)
	CV	http://hl7.org/fhir/v3/TimingEvent	CV	Description: dinner (from lat. cibus vespertinus)
	AC	http://hl7.org/fhir/v3/TimingEvent	AC	before meal (from lat. ante cibus)
	ACM	http://hl7.org/fhir/v3/TimingEvent	ACM	before breakfast (from lat. ante cibus matutinus)
	ACD	http://hl7.org/fhir/v3/TimingEvent	ACD	before lunch (from lat. ante cibus diurnus)
	ACV	http://hl7.org/fhir/v3/TimingEvent	ACV	before dinner (from lat. ante cibus vespertinus)
	PC	http://hl7.org/fhir/v3/TimingEvent	PC	after meal (from lat. post cibus)
	PCM	http://hl7.org/fhir/v3/TimingEvent	PCM	after breakfast (from lat. post cibus matutinus)
	PCD	http://hl7.org/fhir/v3/TimingEvent	PCD	after lunch (from lat. post cibus diurnus)
	PCV	http://hl7.org/fhir/v3/TimingEvent	PCV	after dinner (from lat. post cibus vespertinus)
	*/
	private when: any[] = [
		{ code: 'morn', display: 'morning', synonyms: [ 'morning', 'morn', 'am', 'a.m.' ] },
		{ code: 'aft', display: 'afternoon', synonyms: [ 'afternoon', 'aft', 'pm', 'p.m.' ] },
		{ code: 'eve', display: 'evening', synonyms: [ 'evening', 'eve' ] },
		{ code: 'night', display: 'night', synonyms: [ 'night', 'hs', 'h.s.' ] }				
	];

	// NOTE: periodUnit 'day' should include pretty much all of 'when' array
	/* https://www.hl7.org/fhir/valueset-units-of-time.html
	Code	Display	Definition
	s	second	second
	min	minute	minute
	h	hour	hour
	d	day	day
	wk	week	week
	mo	month	month
	a	year	year
	*/
	private periodUnit: any[] = [
		{ code: 'd', display: 'day', synonyms: [ 'days', 'day', 'd', 'morning', 'morn', 'am', 'a.m.', 'afternoon', 'aft', 'pm', 'p.m.', 'evening', 'eve', 'night', 'hs', 'h.s.' ] },
		{ code: 'wk', dispay: 'week', synonyms: [ 'weeks', 'week', 'wk', 'w\\b' ] },
		{ code: 'mo', display: 'month', synonyms: [ 'months', 'month', 'mon', 'mo' ] },
		{ code: 'h', display: 'hour', synonyms: [ 'hours', 'hour', 'hrs', 'hr', 'h\\b' ] },
		{ code: 'min', display: 'minute', synonyms: [ 'minutes', 'minute', 'mins', 'min', 'm\\b' ] },
		{ code: 'a', display: 'year', synonyms: [ 'years', 'year', 'yrs', 'yr', 'y\\b' ] },			
		{ code: 's', display: 'second', synonyms: [ 'seconds', 'second', 'secs', 'sec', 's\\b' ] }
	];

	// TODO: associate these common codings with each structured frequency
	/* https://www.hl7.org/fhir/valueset-timing-abbreviation.html
	Code	Display	Definition
	BID	BID	Two times a day at institution specified time
	TID	TID	Three times a day at institution specified time
	QID	QID	Four times a day at institution specified time
	AM	AM	Every morning at institution specified times
	PM	PM	Every afternoon at institution specified times
	QD	QD	Every Day at institution specified times
	QOD	QOD	Every Other Day at institution specified times
	Q4H	Q4H	Every 4 hours at institution specified times
	Q6H	Q6H	Every 6 Hours at institution specified times
	*/

	constructor() { }
	
	getRegexRange() { return this.regexRange; }
	
	getRegexDaysOfWeek() { return this.regexDaysOfWeek; }
	
	getStandard(o: any[], s: string) {
		// NOTE: which is faster? indexOf or RegExp?
		//var r = o.find(i => i.synonyms.indexOf(s.toLowerCase()) > -1);
		// RegExpExecArray
		var r = o.find(i => new RegExp('(?:\\b' + i.synonyms.join('|') + '\\b)', 'ig').exec(s) ? true : false);
		return r ? r.code : r;		
	}
 
	getWhen(s: string) {
		return this.getStandard(this.when, s);
	}
	
	getPeriodUnit(s: string) {
		return this.getStandard(this.periodUnit, s);
	}
	
	getDayOfWeek(s: string) {
		return this.getStandard(this.dayOfWeek, s);
	}
}
