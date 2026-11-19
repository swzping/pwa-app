import Config from 'react-native-config';

import {Storage} from '@app/helpers/Storage';
import {ensureOAuthAccessFresh} from '@app/helpers/TokenRefresh';

/**
 * ---------------------------------------------------- *
 * @constant getRestBaseUrl
 * @summary 由 GRAPHQL_BASE_URL 推导 Magento REST 根地址：
 *          https://host/graphql -> https://host
 * ---------------------------------------------------- *
 */
export const getRestBaseUrl = () => {
  const graphqlUrl = Config.GRAPHQL_BASE_URL || '';
  const origin = graphqlUrl.replace(/\/graphql\/?$/i, '');
  return origin || Config.PWA_BASE_URL || '';
};

/**
 * ---------------------------------------------------- *
 * @function uploadReturnAttachment
 * @summary 上传退货凭证（一次一个文件），返回 {token, type,
 *          file_name, size}（Cancel & Return API 文档 §3）
 *
 * @notes
 * - multipart/form-data，字段名固定为 file，需要客户登录态
 * - 服务端按文件内容校验类型；错误为 HTTP 400 + {message}，
 *   message 可直接展示
 * - token 一次性、24 小时过期，最多 10 个未使用 token
 * ---------------------------------------------------- *
 *
 * @param {object} file 形如 {path, mime, filename}（image-crop-picker 结果）
 * @returns {Promise<object>} {token, type, file_name, size}
 */
export const uploadReturnAttachment = async file => {
  if (!file?.path) {
    throw new Error('No file was received, or the file exceeds the allowed size.');
  }

  await ensureOAuthAccessFresh();
  const token = await Storage.get(Storage.name.TOKEN);

  const fileName =
    file.filename ||
    file.name ||
    file.path.split('/').pop() ||
    `evidence-${Date.now()}`;

  const formData = new FormData();
  formData.append('file', {
    uri: file.path,
    type: file.mime || 'application/octet-stream',
    name: fileName,
  });

  const response = await fetch(
    `${getRestBaseUrl()}/rest/V1/dfi-rma/attachments`,
    {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    },
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        'Upload failed. Please check your connection and try again.',
    );
  }

  return payload;
};

/**
 * ---------------------------------------------------- *
 * @function uploadReturnAttachments
 * @summary 并行上传多个文件，返回与入参顺序一致的 token 数组；
 *          任一失败即抛出（调用方负责提示后中断提交）
 * ---------------------------------------------------- *
 */
export const uploadReturnAttachments = async files => {
  const results = await Promise.all(
    (files || []).map(file => uploadReturnAttachment(file)),
  );
  return results.map(result => result.token);
};
