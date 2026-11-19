import {cbc} from '@noble/ciphers/aes';
import {bytesToUtf8, utf8ToBytes} from '@noble/ciphers/utils';

const bytesToBase64 = bytes => {
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return global.btoa(binary);
};

const base64ToBytes = base64 => {
  const binary = global.atob(base64);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
};
/**
 * ---------------------------------------------------- *
 * @function onEncrypt
 * @param {data, iv, mode} object configuration encrypt
 * @summary ecnryption with aes method
 * @returns {string} encryption
 * ---------------------------------------------------- *
 */
export const onEncrypt = ({data, key}) => {
  const iv = key.substring(0, 16);
  const cipher = cbc(utf8ToBytes(key), utf8ToBytes(iv));
  return bytesToBase64(cipher.encrypt(utf8ToBytes(data)));
};

/**
 * ---------------------------------------------------- *
 * @function onEncrypt
 * @param {data, iv, mode} object configuration encrypt
 * @summary ecnryption with aes method
 * @returns {string} encryption
 * ---------------------------------------------------- *
 */
export const onDecrypt = ({data, key}) => {
  const iv = key.substring(0, 16);
  const decipher = cbc(utf8ToBytes(key), utf8ToBytes(iv));
  return bytesToUtf8(decipher.decrypt(base64ToBytes(data)));
};
