import {parseDocument} from 'htmlparser2';
import {findOne, getText} from 'domutils';
import {Colors} from '@app/styles';
import {getAdvanced} from '../../utils';

function addStyleToUlOl(obj) {
  if (!obj?.content) {
    return obj;
  }

  const {cssClasses} = getAdvanced(obj);
  const isGuardianRunFinal = cssClasses?.includes(
    'guardian-run-spec-text-final',
  );

  const baseStyle =
    'font-family:Noto Sans;padding:0;margin:0;font-weight:500;line-height:21px;letter-spacing:0.6px;width:98%;';

  obj.content = obj.content.replace(
    /(<ul[^>]*)(>)/gi,
    `$1 style="${baseStyle}padding-left:20px;list-style-type:disc;font-size:14px;"$2`,
  );

  obj.content = obj.content.replace(
    /(<ol[^>]*)(>)/gi,
    `$1 style="${baseStyle}padding-left:23px;list-style-type:decimal;font-size:14px;${
      isGuardianRunFinal ? 'padding-bottom:15px;' : ''
    }"$2`,
  );

  obj.content = obj.content.replace(
    /(<span[^>]*)(>)/gi,
    '$1 style="font-weight:500"$2',
  );

  obj.content = obj.content.replace(/(<li)([^>]*>)/gi, (_, start, rest) =>
    rest.includes('style=')
      ? `${start}${rest.replace(
          /style="([^"]*)"/,
          'style="$1;padding-left:4px"',
        )}`
      : `${start} style="padding-left:2px"${rest}`,
  );

  obj.noPaddingTopAndBottom = true;
  return obj;
}

export default node => {
  const {cssClasses} = getAdvanced(node);
  if (cssClasses?.includes('heading-2column')) {
    const doc = parseDocument(node.content);

    const strong = findOne(n => n.type === 'tag' && n.name === 'strong', doc);
    const text = strong ? getText(strong).trim() : '';

    const a = findOne(n => n.type === 'tag' && n.name === 'a', doc);
    const view_all_url = a?.attribs?.href || '';

    return {
      contentType: 'heading',
      text,
      color: Colors.PRIMARY,
      view_all_url,
    };
  }
  if (cssClasses?.includes('guardian-run-register')) {
    const doc = parseDocument(node.content);

    const spanText = findOne(n => n.type === 'tag' && n.name === 'span', doc);
    const text = spanText ? getText(spanText).trim() : '';

    const a = findOne(n => n.type === 'tag' && n.name === 'a', doc);
    const view_all_url = a?.attribs?.href || '';
    return {
      contentType: 'buttonToWebView',
      link: view_all_url,
      text,
    };
  }
  if (cssClasses?.includes('guardian-run-spec-text')) {
    return addStyleToUlOl(node);
  }
  return {
    content: node.content,
  };
};
