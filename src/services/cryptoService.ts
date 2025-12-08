import CryptoJS from "crypto-js";

const AES_KEY = "d0nthackcl0n3tab"; // same key used in Java

// Convert key into Utf8 format
const key = CryptoJS.enc.Utf8.parse(AES_KEY);

const cryptoService = {
  encrypt(plainText: string): string | null {
    try {
      const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      return encrypted.toString(); // Base64 output (Java-compatible)
    } catch (error) {
      console.error("Encryption Error:", error);
      return null;
    }
  },

  decrypt(cipherText: string): string | null {
    try {
      const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption Error:", error);
      return null;
    }
  },
};

export default cryptoService;
