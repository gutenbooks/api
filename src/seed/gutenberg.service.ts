import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Console, Command, createSpinner } from 'nestjs-console';
import * as http from 'http';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import { parseStringPromise } from 'xml2js';

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

@Injectable()
@Console({
    name: 'seed:gutenberg',
    description: 'Seed the project DB with Project Gutenberg data',
})
export class GutenbergService {

  public static CATALOG_URL = 'http://gutenberg.readingroo.ms/cache/generated/feeds/rdf-files.tar.bz2'
  public static CATALOG_TEMP_DOWNLOAD = '/tmp/catalog.tar.bz2';
  public static CATALOG_TEMP_UNPACKED = '/tmp/catalog';

  public readonly spinner: any;

  constructor(
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
    this.clean();

    await this.download();
    this.cleanStale();
    await this.upsertAll();

    this.clean();
  }

  @Command({
    command: 'download',
    description: 'Download and decompress the Project Gutenberg catalog',
  })
  async download(): Promise<void> {
    this.spinner.start('Downloading compressed catalog.');
    await this.getCatalog();
    this.runCommand('ls', [ '-lh', GutenbergService.CATALOG_TEMP_DOWNLOAD ]);
    this.spinner.succeed('Finished downloading compressed catalog.');

    this.spinner.start('Decompressing catalog (this takes some time).');
    fs.mkdirSync(GutenbergService.CATALOG_TEMP_UNPACKED);
    this.runCommand('tar', [ 'fjvx',  GutenbergService.CATALOG_TEMP_DOWNLOAD, '-C', GutenbergService.CATALOG_TEMP_UNPACKED ]);
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
    this.spinner.start('Beginning catalog upsert (this may take several minutes).');

    const allIds = fs
      .readdirSync(`${GutenbergService.CATALOG_TEMP_UNPACKED}/cache/epub`)
      .filter((id) => {
        return /^[\d]+$/.test(id);
      })
    ;

    const ids: number[] = allIds.map((id) => parseInt(id, 10));
    ids.sort((a: number, b: number) => a - b);

    const logRange: number = 1000;
    for (const idx in ids) {
      const id: number = ids[idx];
      const mod: number = parseInt(idx, 10) % logRange;

      if (mod === 0) {
        console.log(`Upserting range: ${idx} of ${ids.length}`);
      }

      try {
        await this.upsert(id);
      } catch (err) {
        console.error(`error processing id ${id}`, err);
      }

    }

    this.spinner.succeed('Finished catalog upsert.');
  }

  async upsert(id: number): Promise<void> {
    const parsed = await this.getBookById(id);
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
    book.title = parsed.title;
    book = await this.bookRepository.save(book);

    // ///////////////////
    // update edition fields
    // ///////////////////
    edition.title = parsed.title;
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
        contribution.book = book;
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
          .where(
            `book.id = :id AND taxon.id = :taxonId`,
            { id: book.id, taxonId: taxon.id },
          )
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



    // let subjects = await this.taxonomyRepository.findOne({ name: 'Subjects' });
  }

  async getBookById(id: number): Promise<any> {
    const object = await this.parseFile(id);

    if (!object) {
      console.log('Unable to process id ', id);
      return;
    }

    const root = object['rdf:RDF'];
    const ebook = root['pgterms:ebook'][0];
    const book = {
      id: id,
      title: ebook['dcterms:title']? ebook['dcterms:title'][0] : undefined,
      type: ebook['dcterms:type'] ? ebook['dcterms:type'][0]['rdf:Description'][0]['rdf:value'][0] : undefined,
      language: ebook['dcterms:language'][0]['rdf:Description'][0]['rdf:value'][0]['_'],
      publishedAt: ebook['dcterms:issued'][0]['_'],
      downloads: ebook['pgterms:downloads'][0]['_'],
      publisher: ebook['dcterms:publisher'][0],
      authors: [],
      subjects: [],
      formats: [],
      bookshelves: [],
      copyright: null,
    };

    // ///////////////
    // authors
    // ///////////////
    if (ebook['dcterms:creator']) {
      for (const creator of ebook['dcterms:creator']) {
        const c = creator['pgterms:agent'][0];
        const author: any = {
          birth: c['pgterms:birthdate'] ? c['pgterms:birthdate'][0]['_'] : undefined,
          death: c['pgterms:deathdate'] ? c['pgterms:deathdate'][0]['_'] : undefined,
          webpage: c['pgterms:webpage'] ? c['pgterms:webpage'][0]['$']['rdf:resource'] : undefined,
          name: c['pgterms:name'] ? c['pgterms:name'][0] : undefined,
        };

        book.authors.push(author);
      }
    }

    // ///////////////
    // subjects
    // ///////////////
    if (ebook['dcterms:subject']) {
      for (const subject of ebook['dcterms:subject']) {
        const s = subject['rdf:Description'][0];
        const isLCSH = s['dcam:memberOf'].some((m) => /^.*LCSH$/.test(m['$']['rdf:resource']));

        if (isLCSH) {
          book.subjects.push(s['rdf:value'][0]);
        }
      }

      book.subjects.sort();
    }

    // ///////////////
    // bookshelves
    // ///////////////
    if (ebook['pgterms:bookshelf']) {
      for (const shelf of ebook['pgterms:bookshelf']) {
        const s = shelf['rdf:Description'][0];
        book.bookshelves.push(s['rdf:value'][0]);
      }

      book.bookshelves.sort();
    }

    // ///////////////
    // copyright
    // ///////////////
    const rights = ebook['dcterms:rights'][0];
    if (rights.startsWith('Public domain in the USA.')) {
      book.copyright = false;
    } else if (rights.startsWith('Copyrighted.')) {
      book.copyright = true;
    }

    // ///////////////
    // formats
    // ///////////////
    const includeTypes = [
      'application/x-mobipocket-ebook',
      'application/epub+zip',
      'text/html',
      'text/plain',
      'text/plain; charset=us-ascii',
    ];
    for (const format of ebook['dcterms:hasFormat']) {
      const f = format['pgterms:file'][0];
      const type = f['dcterms:format'][0]['rdf:Description'][0]['rdf:value'][0]['_'];

      if (includeTypes.includes(type)) {
        const file = f['$']['rdf:about'];
        book.formats.push({
          file,
          description: /^.*\.images$/.test(file) ? 'Images' : null,
          type,
          modifiedAt: f['dcterms:modified'][0]['_'],
        });
      }
    }

    return book;
  }

  runCommand(command: string, args: any) {
    const cmd = spawnSync(
      command,
      args,
    );

    console.error(`stderr: ${cmd.stderr.toString()}` );
    console.log(`stdout: ${cmd.stdout.toString()}` );
  }

  clean() {
    if (fs.existsSync(GutenbergService.CATALOG_TEMP_DOWNLOAD)) {
      fs.unlinkSync(GutenbergService.CATALOG_TEMP_DOWNLOAD);
    }

    if (fs.existsSync(GutenbergService.CATALOG_TEMP_UNPACKED)) {
      fs.rmdirSync(GutenbergService.CATALOG_TEMP_UNPACKED);
    }
  }


  async getCatalog(
    url: string = GutenbergService.CATALOG_URL,
    filePath: string = GutenbergService.CATALOG_TEMP_DOWNLOAD,
  ): Promise<void> {
    const file = fs.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        resp.on('data', (data) => {
          file.write(data);
        }).on('end', () => {
          file.end();
          resolve();
        });
      });
    });
  }

  async parseFile(id: string|number): Promise<any> {
    const path: string = `${GutenbergService.CATALOG_TEMP_UNPACKED}/cache/epub/${id}/pg${id}.rdf`;
    const data: any = fs.readFileSync(path, 'utf8');
    return await parseStringPromise(data);
  }
}
