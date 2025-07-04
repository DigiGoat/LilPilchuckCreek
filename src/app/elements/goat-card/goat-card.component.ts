import { CurrencyPipe } from '@angular/common';
import { booleanAttribute, Component, Input, type OnChanges } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '../../services/config/config.service';
import { type Goat, GoatService } from '../../services/goat/goat.service';
import { ImageEntry, ImageService } from '../../services/image/image.service';
@Component({
  selector: 'app-goat-card',
  templateUrl: './goat-card.component.html',
  styleUrls: ['./goat-card.component.scss'],
  standalone: false
})
export class GoatCardComponent implements OnChanges {
  constructor(private imageService: ImageService, private meta: Meta, private configService: ConfigService, private route: ActivatedRoute, private goatService: GoatService) { }

  @Input() goat?: Partial<Goat>;
  @Input({ transform: booleanAttribute, alias: 'for-sale' }) forSale?: boolean = false;
  name?: string;
  nickname?: string;
  description?: string;
  id?: string;
  born?: string;
  deceased?: string | null;
  price?: number | string;
  image?: ImageEntry;
  identifier?: string;
  linearAppraisal?: Required<Goat>['linearAppraisals'][number];
  awards?: string;
  lactation?: string;
  ngOnChanges() {
    this.name = this.goat?.name;
    this.nickname = this.goat?.nickname;
    this.description = this.goat?.description;
    this.id = this.goat?.normalizeId;
    this.born = this.goat?.dateOfBirth;
    this.deceased = this.goat?.dateOfDeath;
    if (this.forSale) {
      try {
        this.price = (new CurrencyPipe('en-US')).transform(this.goat?.price) || this.price;
      } catch {
        this.price = this.goat?.price;
      }
    }
    this.image = this.imageService.getImage([this.id, this.name, this.nickname]);
    this.identifier = (this.nickname || this.name || this.id)?.replace(/ /g, '-');
    if (!this.route.snapshot.params['goat']) {
      this.setOGImages();
    }
    this.linearAppraisal = this.goatService.getAppraisal(this.goat?.linearAppraisals);
    this.awards = this.goatService.getAwards(this.goat?.awards);
    this.lactation = this.goat?.lactationRecords?.find(lactation => lactation.isCurrent)?.lactationNumber;

  }
  setOGImages() {
    if (this.image && this.image.file !== '/') {
      if (!this.meta.getTags('property="og:image"').find(tag => tag.content.endsWith(this.image!.file))) {
        this.meta.addTag({ property: 'og:image', content: this.configService.link ? new URL(this.image.file, this.configService.link).toString() : this.image.file });
        //this.meta.addTags([{ name: 'og:image:width', content: '400' }, { name: 'og:image:height', content: '200' }], true);
        if (this.image.alt) {
          this.meta.addTag({ property: 'og:image:alt', content: this.image.alt });
        }
      }
    }
  }
}
