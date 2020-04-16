import { Injectable } from '@nestjs/common';
import * as http from 'http';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class GutenbergHelperService {

  public static CATALOG_URL = 'http://gutenberg.readingroo.ms/cache/generated/feeds/rdf-files.tar.bz2'
  public static CATALOG_TEMP_DOWNLOAD = '/tmp/catalog.tar.bz2';
  public static CATALOG_TEMP_UNPACKED = '/tmp/catalog';

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

  clean(): void {
    if (fs.existsSync(GutenbergHelperService.CATALOG_TEMP_DOWNLOAD)) {
      fs.unlinkSync(GutenbergHelperService.CATALOG_TEMP_DOWNLOAD);
    }

    if (fs.existsSync(GutenbergHelperService.CATALOG_TEMP_UNPACKED)) {
      fs.rmdirSync(GutenbergHelperService.CATALOG_TEMP_UNPACKED);
    }
  }

  async getCatalog(
    url: string = GutenbergHelperService.CATALOG_URL,
    filePath: string = GutenbergHelperService.CATALOG_TEMP_DOWNLOAD,
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
    const path: string = `${GutenbergHelperService.CATALOG_TEMP_UNPACKED}/cache/epub/${id}/pg${id}.rdf`;
    const data: any = fs.readFileSync(path, 'utf8');
    return await parseStringPromise(data);
  }

  parseTitle(flatTitle: string|undefined): { title: string, subtitle: string|null } {
    const result = { title: flatTitle, subtitle: null };

    if (flatTitle) {
      const parts = flatTitle
        .replace('\n', ':')
        .replace('\r', ':')
        .replace('\r\n', ':')
        .split(/[:;]/)
      ;
      const title = parts.splice(0, 1)[0].trim();
      result.title = title;
      const subtitle = parts.join(' ').trim();
      result.subtitle = subtitle.length > 0 ? subtitle : null;
    }

    return result;
  }
}
