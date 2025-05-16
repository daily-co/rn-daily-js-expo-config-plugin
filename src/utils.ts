import * as util from 'util';

export function quoted(str: string) {
  return util.format(`"%s"`, str);
}

