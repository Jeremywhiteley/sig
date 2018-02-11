import { Injectable } from '@angular/core';
import { NormalizeService } from '../services/normalize.service';

@Injectable()
export class RouteParser {
	public route: any[] = [];

	constructor(private normalize: NormalizeService) { }
	
	ngOnInit() { }
	
	getRoute(): any[] { return this.route; }

	parse(sig: string): void {
		this.route = [];
		this.patterns.forEach(p => {
			var match: any[] = [];
			while (match = p.pattern.exec(sig)) {
				this.route.push({
					match: match,
					standardized: p.standardize(match)
				});
			}
		});
	}

	getPatterns(): any[] {
		var patterns: any[] = [];
		
		this.routes.map(r => {
			patterns.push({
				pattern: new RegExp('(' + r.display + (r.synonyms ? '|' + r.synonyms.join('|') : '') + ')', 'ig'),
				standardize: (match: any[]) => {
					return {
						coding: {
							system: 'http://snomed.info/sct',
							code: r.code,
							display: r.display
						},
						text: r.display
					}
				}
			});
		});
		
		return patterns;
	}
	
	private routes: any[] = [
		{ code: 26643006, display: 'oral route', synonyms: ['by mouth',	'orally(?! disintegrating)', 'po\\b', 'p\\.o\\.', 'oral\\b'] },
		{ code: 10547007, display: 'otic route', synonyms: ['by ear', '(?:in to|into|in|to|per) (?:the )?(?:right |left |each |both |affected )*ear', '(?:\\ba\\.u\\.|\\ba\\.s\\.\\b|\\ba\\.d\\.\\b|\\bau\\b|a\\.s\\.)'] },
		{ code: 46713006, display: 'nasal route', synonyms: ['nasally', '(?:in to|into|in|to|per)?(?: the)?(?: right| left| each| both| affected)? (?:nose|nostril)'] },
		{ code: 54485002, display: 'ophthalmic route', synonyms: ['ophthalmically', '(?:in to|into|in|to|per)? (?: the)?(?:right |left |each |both |affected )*eye', '(?:\\bo\\.u\\.|\\bo\\.s\\.\\b|\\bo\\.d\\.\\b|\\bou\\b|\\bos\\b|\\bos\\b)'] },
		{ code: 16857009, display: 'vaginal route', synonyms: ['(?:in to|into|in|to|per)(?: the)? vagina', 'vaginally', 'p\\.v\\.', 'pv\\b'] },
		{ code: 37839007, display: 'sublingual route', synonyms: ['under the tongue', 'sublingual', 'sublingually', '\\bs\\.l\\.\\b', '\\bsl\\b'] },
		{ code: 34206005, display: 'subcutaneous route', synonyms: ['(?:in|under) the skin', 'subcutaneous', 'subq\\b', 'sub\\.q\\.', 'sc\\b', 's\\.c\\.', 'sq\\b', 's\\.q\\.'] },
		{ code: 6064005, display: 'topical route', synonyms: ['(?:to|on) the skin', 'topically', '(?:to|on) affected area'] },
		{ code: 37161004, display: 'rectal route', synonyms: ['rectally', 'p\\.r\\.\\b', 'pr\\b'] },
		{ code: 78421000, display: 'intramuscular route', synonyms: ['i\\.m\\.\\b', '\\bim\\b', 'intramuscular' ] },
		{ code: 47625008, display: 'intravenous route', synonyms: ['i\\.v\\.', '\\biv\\b', 'intravenous'] },
		{ code: 448598008, display: 'cutaneous route', synonyms: ['\\bcutaneous'] },
		{ code: 45890007, display: 'transdermal route', synonyms: ['transdermally'] },
		{ code: 417985001, display: 'enteral route', synonyms: ['enterally'] },
		{ code: 127490009, display: 'gastrostomy route', synonyms: ['via g(?:-| )?tube'] },
		{ code: 127491008, display: 'jejunostomy route', synonyms: ['via j(?:-| )?tube'] },
		{ code: 127492001, display: 'nasogastric route', synonyms: ['via (?:ng|n\\.g\\.)(?:-| )?tube'] },
		{ code: 372449004, display: 'dental route', synonyms: ['dentally', 'to(?: the)? teeth'] },
		{ code: 12130007, display: 'intra-articular route', synonyms: ['(?:in to|into|in|to|per) the joint'] },
		{ code: 447694001, display: 'respiratory tract route', synonyms: ['nebulize', 'via inhalation'] },
		/*
		{ code: 90028008, display: 'urethral route' }
		{ code: 372450004, display: 'endocervical route' },
		{ code: 372451000, display: 'endosinusial route' },
		{ code: 372452007, display: 'endotracheopulmonary route' },
		{ code: 372453002, display: 'extra-amniotic route' },
		{ code: 372454008, display: 'gastroenteral route' },
		{ code: 372457001, display: 'gingival route' },
		{ code: 372458006, display: 'intraamniotic route' },
		{ code: 372459003, display: 'intrabursal route' },
		{ code: 372460008, display: 'intracardiac route' },
		{ code: 372461007, display: 'intracavernous route' },
		{ code: 372463005, display: 'intracoronary route' },
		{ code: 372464004, display: 'intradermal route' },
		{ code: 372465003, display: 'intradiscal route' },
		{ code: 372466002, display: 'intralesional route' },
		{ code: 372467006, display: 'intralymphatic route' },
		{ code: 372468001, display: 'intraocular route' },
		{ code: 372469009, display: 'intrapleural route' },
		{ code: 372470005, display: 'intrasternal route' },
		{ code: 372471009, display: 'intravesical route' },
		{ code: 372473007, display: 'oromucosal route' },
		{ code: 372474001, display: 'periarticular route' },
		{ code: 372475000, display: 'perineural route' },
		{ code: 372476004, display: 'subconjunctival route' },
		{ code: 37737002, display: 'intraluminal route' },
		{ code: 38239002, display: 'intraperitoneal route' },
		{ code: 404815008, display: 'transmucosal route' },
		{ code: 404819002, display: 'intrabiliary route' },
		{ code: 404820008, display: 'epidural route' },
		{ code: 416174007, display: 'suborbital route' },
		{ code: 417070009, display: 'caudal route' },
		{ code: 417255000, display: 'intraosseous route' },
		{ code: 417950001, display: 'intrathoracic route' },
		{ code: 417989007, display: 'intraductal route' },
		{ code: 418091004, display: 'intratympanic route' },
		{ code: 418114005, display: 'intravenous central route' },
		{ code: 418133000, display: 'intramyometrial route' },
		{ code: 418136008, display: 'gastro-intestinal stoma route' },
		{ code: 418162004, display: 'colostomy route' },
		{ code: 418204005, display: 'periurethral route' },
		{ code: 418287000, display: 'intracoronal route' },
		{ code: 418321004, display: 'retrobulbar route' },
		{ code: 418331006, display: 'intracartilaginous route' },
		{ code: 418401004, display: 'intravitreal route' },
		{ code: 418418000, display: 'intraspinal route' },
		{ code: 418441008, display: 'orogastric route' },
		{ code: 418511008, display: 'transurethral route' },
		{ code: 418586008, display: 'intratendinous route' },
		{ code: 418608002, display: 'intracorneal route' },
		{ code: 418664002, display: 'oropharyngeal route' },
		{ code: 418722009, display: 'peribulbar route' },
		{ code: 418730005, display: 'nasojejunal route' },
		{ code: 418743005, display: 'fistula route' },
		{ code: 418813001, display: 'surgical drain route' },
		{ code: 418821007, display: 'intracameral route' },
		{ code: 418851001, display: 'paracervical route' },
		{ code: 418877009, display: 'intrasynovial route' },
		{ code: 418887008, display: 'intraduodenal route' },
		{ code: 418892005, display: 'intracisternal route' },
		{ code: 418947002, display: 'intratesticular route' },
		{ code: 418987007, display: 'intracranial route' },
		{ code: 419021003, display: 'tumor cavity route' },
		{ code: 419165009, display: 'paravertebral route' },
		{ code: 419231003, display: 'intrasinal route' },
		{ code: 419243002, display: 'transcervical route' },
		{ code: 419320008, display: 'subtendinous route' },
		{ code: 419396008, display: 'intraabdominal route' },
		{ code: 419601003, display: 'subgingival route' },
		{ code: 419631009, display: 'intraovarian route' },
		{ code: 419684008, display: 'ureteral route' },
		{ code: 419762003, display: 'peritendinous route' },
		{ code: 419778001, display: 'intrabronchial route' },
		{ code: 419810008, display: 'intraprostatic route' },
		{ code: 419874009, display: 'submucosal route' },
		{ code: 419894000, display: 'surgical cavity route' },
		{ code: 419954003, display: 'ileostomy route' },
		{ code: 419993007, display: 'intravenous peripheral route' },
		{ code: 420047004, display: 'periosteal route' },
		{ code: 420163009, display: 'esophagostomy route' },
		{ code: 420168000, display: 'urostomy route' },
		{ code: 420185003, display: 'laryngeal route' },
		{ code: 420201002, display: 'intrapulmonary route' },
		{ code: 420204005, display: 'mucous fistula route' },
		{ code: 420218003, display: 'nasoduodenal route' },
		{ code: 420254004, display: 'body cavity route' },
		{ code: 420287000, display: 'intraventricular route - cardiac' },
		{ code: 420719007, display: 'intracerebroventricular route' },
		{ code: 428191002, display: 'percutaneous route' },
		{ code: 429817007, display: 'interstitial route' },
		{ code: 432671000124106, display: 'arteriovenous graft route' },
		{ code: 445752009, display: 'intraesophageal route' },
		{ code: 445754005, display: 'intragingival route' },
		{ code: 445755006, display: 'intravascular route' },
		{ code: 445756007, display: 'intradural route' },
		{ code: 445767008, display: 'intrameningeal route' },
		{ code: 445768003, display: 'intragastric route' },
		{ code: 445769006, display: 'intracorpus cavernosum route' },
		{ code: 445771006, display: 'intrapericardial route' },
		{ code: 445913005, display: 'intralingual route' },
		{ code: 445941009, display: 'intrahepatic route' },
		{ code: 446105004, display: 'conjunctival route' },
		{ code: 446407004, display: 'intraepicardial route' },
		{ code: 446435000, display: 'transendocardial route' },
		{ code: 446442000, display: 'transplacental route' },
		{ code: 446540005, display: 'intracerebral route' },
		{ code: 447026006, display: 'intraileal route' },
		{ code: 447052000, display: 'periodontal route' },
		{ code: 447080003, display: 'peridural route' },
		{ code: 447081004, display: 'lower respiratory tract route' },
		{ code: 447121004, display: 'intramammary route' },
		{ code: 447122006, display: 'intratumor route' },
		{ code: 447227007, display: 'transtympanic route' },
		{ code: 447229005, display: 'transtracheal route' },
		{ code: 447964005, display: 'digestive tract route' },
		{ code: 448077001, display: 'intraepidermal route' },
		{ code: 448491004, display: 'intrajejunal route' },
		{ code: 448492006, display: 'intracolonic route' },
		{ code: 54471007, display: 'buccal route' },
		{ code: 58100008, display: 'intra-arterial route' },
		{ code: 60213007, display: 'intramedullary route' },
		{ code: 62226000, display: 'intrauterine route' },
		{ code: 697971008, display: 'arteriovenous fistula route' },
		{ code: 72607000, display: 'intrathecal route' },
		*/
  ];
  
  private patterns: any[] = this.getPatterns();
}