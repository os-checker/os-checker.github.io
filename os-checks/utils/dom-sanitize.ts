import DOMPurify from 'dompurify';

/** 对 <>&"' 之类的符号进行转义，否则 highlightjs 出现 One of your code blocks
* includes unescaped HTML. This is a potentially serious security risk.
*/
export default function (s: string): string {
  return DOMPurify.sanitize(s);
}
