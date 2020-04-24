import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, getConnection } from 'typeorm';
import { Console, Command, createSpinner } from 'nestjs-console';
import * as fs from 'fs';
import { spawnSync } from 'child_process';

import {
 BookContribution,
 Book,
 BookRepository,
 Contributor,
 ContributionType,
 EditionContribution,
 Edition,
 Format,
 Identifier,
 IdentifierType,
} from '../book';

import {
  Language,
} from '../language';

import {
 Taxon,
 Taxonomy,
} from '../taxonomy';

import { GutenbergHelperService } from './gutenberg-helper.service';


@Injectable()
@Console({
    name: 'seed:gutenberg',
    description: 'Seed the project DB with Project Gutenberg data',
})
export class GutenbergService {
  public readonly spinner: any;

  constructor(
    protected readonly gutenbergHelperService: GutenbergHelperService,
    @InjectRepository(BookContribution)
    protected readonly bookContributionRepository: Repository<BookContribution>,
    protected readonly bookRepository: BookRepository,
    @InjectRepository(Contributor)
    protected readonly contributorRepository: Repository<Contributor>,
    @InjectRepository(EditionContribution)
    protected readonly editionContributionRepository: Repository<EditionContribution>,
    @InjectRepository(Edition)
    protected readonly editionRepository: Repository<Edition>,
    @InjectRepository(Format)
    protected readonly formatRepository: Repository<Format>,
    @InjectRepository(Identifier)
    protected readonly identifierRepository: Repository<Identifier>,
    @InjectRepository(Language)
    protected readonly languageRepository: Repository<Language>,
    @InjectRepository(Taxon)
    protected readonly taxonRepository: Repository<Taxon>,
    @InjectRepository(Taxonomy)
    protected readonly taxonomyRepository: Repository<Taxonomy>,
  ) {
    this.spinner = createSpinner();
  }

  @Command({
    command: 'all',
    description: 'Seed the Project Gutenberg data',
  })
  async all(): Promise<void> {
    this.gutenbergHelperService.clean();

    await this.download();
    this.cleanStale();
    await this.upsertAll();
    await this.merge();

    this.gutenbergHelperService.clean();
  }

  @Command({
    command: 'download',
    description: 'Download and decompress the Project Gutenberg catalog',
  })
  async download(): Promise<void> {
    this.spinner.start('Downloading compressed catalog.');
    await this.gutenbergHelperService.getCatalog();
    this.gutenbergHelperService.runCommand('ls', [ '-lh', GutenbergHelperService.CATALOG_TEMP_DOWNLOAD ]);
    this.spinner.succeed('Finished downloading compressed catalog.');

    this.spinner.start('Decompressing catalog (this takes some time).');
    fs.mkdirSync(GutenbergHelperService.CATALOG_TEMP_UNPACKED);
    this.gutenbergHelperService.runCommand('tar', [ 'fjvx',  GutenbergHelperService.CATALOG_TEMP_DOWNLOAD, '-C', GutenbergHelperService.CATALOG_TEMP_UNPACKED ]);
    this.spinner.succeed('Decompressing catalog.');
  }

  @Command({
    command: 'clean-stale',
    description: 'Clean up any stale data in the decompressed catalog',
  })
  async cleanStale(): Promise<void> {
    this.spinner.start('Detecting stale directories.');
    // TODO: not sure if this is needed if we do an upsert
    this.spinner.succeed('Detecting stale directories.');

    this.spinner.start('Removing stale directories and books.');
    // TODO: not sure if this is needed if we do an upsert
    this.spinner.succeed('Removing stale directories and books.');
  }

  @Command({
    command: 'upsert',
    description: 'Upsert the decompressed catalog into the database',
  })
  async upsertAll(): Promise<void> {
    const spinner = this.spinner.start('Beginning catalog upsert (this may take several minutes).');

    const allIds = fs
      .readdirSync(`${GutenbergHelperService.CATALOG_TEMP_UNPACKED}/cache/epub`)
      .filter((id) => {
        return /^[\d]+$/.test(id);
      })
    ;

    const ids: number[] = allIds.map((id) => parseInt(id, 10));
    ids.sort((a: number, b: number) => a - b);

    for (const idx in ids) {
      spinner.text = `Upserting ${idx} of ${ids.length}`;
      const id: number = ids[idx];
      try {
        await this.upsert(id);
      } catch (err) {
        console.error(`\nError processing id ${id}`, err);
      }

    }

    this.spinner.succeed('Finished catalog upsert.');
  }

  async upsert(id: number): Promise<void> {
    const parsed = await this.gutenbergHelperService.getBookById(id);
    const language = await this.languageRepository.findOne({ code: parsed.language });
    let book: Book = await this.bookRepository
      .findOneByIdentifier(
        IdentifierType.GUTENBERG,
        parsed.id.toString()
      )
    ;

    let edition;
    let identifier;

    // console.log(parsed);
    if (!book) {
      book = new Book();
      edition = new Edition();
      edition.formats = [];
      identifier = new Identifier();
    } else {
      identifier = await this.identifierRepository.findOne({
        type: IdentifierType.GUTENBERG,
        value: parsed.id.toString(),
      });

      if (!identifier) {
        throw new Error('this shouldn\'t happen');
      }

      // load from repo so formats are fetched also
      edition = await this.editionRepository.findOne(identifier.editionId);
    }

    // ///////////////////
    // update book fields
    // ///////////////////
    const parsedTitle = this.gutenbergHelperService.parseTitle(parsed.title)
    book.title = parsedTitle.title;
    book.subtitle = parsedTitle.subtitle;
    book = await this.bookRepository.save(book);

    // ///////////////////
    // update edition fields
    // ///////////////////
    edition.title = parsedTitle.title;
    edition.subtitle = parsedTitle.subtitle;
    edition.language = language;
    edition.downloads = parseInt(parsed.downloads, 10);
    edition.publishedAt = new Date(parsed.publishedAt);
    edition.book = book;
    edition = await this.editionRepository.save(edition);

    // ///////////////////
    // update formats
    // ///////////////////
    let mappedFormats: { [key: string]: Format } = {};

    edition.formats.forEach((format: Format) => {
      mappedFormats[format.file] = format;
    });

    let newFormats: Format[] = [];
    for (const format of parsed.formats) {
      const updateFormat = mappedFormats[format.file];
      if (!updateFormat) {
        // update existing format
        const newFormat = new Format();
        newFormat.file = format.file;
        newFormat.type = Format.formatFromMime(format.type);

        if (format.description) {
          newFormat.description = format.description;
        }

        newFormat.edition = edition;
        newFormats.push(newFormat);
      }
    }

    newFormats = await this.formatRepository.save(newFormats);

    // ///////////////////
    // update identifier fields
    // ///////////////////
    identifier.name = IdentifierType.GUTENBERG;
    identifier.value = parsed.id.toString();
    identifier.edition = edition;
    identifier = await this.identifierRepository.save(identifier);

    // ///////////////////
    // update contributors
    // ///////////////////
    for (const author of parsed.authors) {
      let contributor = await this.contributorRepository.findOne({ sortName: author.name });

      if (!contributor) {
        contributor = new Contributor();
      }

      contributor.sortName = author.name;
      const split = author.name.split(',');
      contributor.name = split[1] ? `${split[1].trim()} ${split[0].trim()}` : `${split[0].trim()}`;
      contributor = await this.contributorRepository.save(contributor);

      let contribution = await this.bookContributionRepository.findOne({
        bookId: book.id,
        type: ContributionType.AUTHOR,
        contributorId: contributor.id,
      });

      if (!contribution) {
        contribution = new BookContribution();
        contribution.type = ContributionType.AUTHOR;
        contribution.bookId = book.id;
        contribution.contributor = contributor;
        contribution.priority = 0;
        contribution = await this.bookContributionRepository.save(contribution);
      }
    }

    // ///////////////////
    // update taxonomies & taxons
    // ///////////////////
    const properties = {
      bookshelves: 'Bookshelves',
      subjects: 'Subjects',
    }

    for (const property of Object.keys(properties)) {
      const name = properties[property];
      let taxonomy = await this.taxonomyRepository.findOne({ name: name });
      if (!taxonomy) {
        taxonomy = new Taxonomy();
        taxonomy.name = name;
        taxonomy = await this.taxonomyRepository.save(taxonomy);
      }

      for (const parsedTaxon of parsed[property]) {
        let taxon = await this.taxonRepository.findOne({ name: parsedTaxon });
        if (!taxon) {
          taxon = new Taxon();
          taxon.name = parsedTaxon;
          taxon.taxonomy = taxonomy;
          taxon = await this.taxonRepository.save(taxon);
        }

        const bookWithTaxon = await this.bookRepository
          .createQueryBuilder('book')
          .leftJoinAndSelect('book.taxons', 'taxon')
          .where(`book.id = :id`, { id: book.id })
          .andWhere(`taxon.id = :taxonId`, { taxonId: taxon.id })
          .getOne()
        ;

        if (!bookWithTaxon) {
          if (!book.taxons) {
            book.taxons = [taxon];
          } else {
            book.taxons.push(taxon);
          }
          await this.bookRepository.save(book);
        }
      }
    }
  }

  @Command({
    command: 'merge',
    description: 'Merge any duplicate books together',
  })
  async merge(): Promise<void> {
    this.spinner.start('Beginning book merge.');
    const duplicates = await this.bookRepository.findDuplicates();
    console.log(duplicates);
    const bookMap = {};

    for (const duplicate of duplicates) {
      await this.mergeBooks(duplicate.ids);
    }

    this.spinner.succeed('Finished book merge.');
  }

  async mergeBooks(ids: number[]) {
    const books = await this.bookRepository.find({
      id: In(ids),
    });
    const primary = books.shift();
    const ops = [];
    for(const book of books) {
      const editions = await this.editionRepository.find({ bookId: book.id });
      console.log(editions);
      for (const edition of editions) {
        await getConnection()
          .createQueryBuilder()
          .relation(Edition, 'book')
          .of(edition.id) // you can use just post id as well
          .set(primary.id)
        ;
      }
    }

    // this.editionRepository.save(primary);
    this.bookRepository.createQueryBuilder('books')
      .delete()
      .where("book.id IN (:...ids)", { ids: books.map(book => book.id) })
      .execute()
    ;
  }
}
