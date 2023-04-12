import { resolve } from 'path';
import { readFileSync } from "fs";
import { parse, ParserOptions } from '@babel/parser';
import { FileInfo } from "./types";
import { isTestSuite } from "./util";
import { Either, left, right } from './either';
import { NoFileError } from './errors';
import { glob } from 'glob';

const parserOptions: ParserOptions = {
  allowReturnOutsideFunction: true,
  errorRecovery: true,
  sourceType: 'module',
  plugins: ["flow", "jsx"]
};

export function parseSuites(pattern: string): Either<NoFileError, FileInfo[]> {
  const files = glob.sync(pattern, { ignore: '**/node_modules/**' });
  if (files.length === 0) {
    return left(new NoFileError());
  }

  const parsedFiles = files.map(path => {
    const code = readFileSync(path, 'utf8');
    const ast = parse(code, parserOptions);
    return <FileInfo>{ path: resolve(path), code: code, ast: ast };
  })

  const filteredFiles = parsedFiles.filter(file => isTestSuite(file.ast));

  return right(filteredFiles);
}