import {onDecrypt, onEncrypt} from '../_src/core/helpers/Encryption';

describe('Encryption helper', () => {
  const key = '12345678901234567890123456789012';
  const plaintext = 'token|cart|/';

  it('keeps the existing AES-256-CBC ciphertext format', () => {
    expect(onEncrypt({data: plaintext, key})).toBe(
      'I0lZChYYY3glL/IuwNBVaQ==',
    );
  });

  it('decrypts ciphertext produced by the checkout integration', () => {
    expect(
      onDecrypt({data: 'I0lZChYYY3glL/IuwNBVaQ==', key}),
    ).toBe(plaintext);
  });
});
