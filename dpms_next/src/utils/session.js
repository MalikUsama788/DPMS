import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

// Set Session Details
export function saveEncodedDataToSession(key, data) {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "default_secret_key";
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();

    Cookies.set(key, encryptedData, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

// Get Session Details
export function decodeSessionData(key) {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY || "default_secret_key";
    const encryptedData = Cookies.get(key);
    if (!encryptedData) return null;

    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error decoding session:", error);
    return null;
  }
}

// Clear Session Details
export function clearSession(keys = ["dpms_jwt", "dpms_user"]) {
  keys.forEach((key) => Cookies.remove(key));
}