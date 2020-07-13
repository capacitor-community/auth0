package com.getcapacitor.community.auth0;

import android.util.Base64;

import androidx.annotation.NonNull;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class Utils {

    private static final String US_ASCII = "US-ASCII";
    private static final String SHA_256 = "SHA-256";

    public static String generateRandomValue() {
        SecureRandom sr = new SecureRandom();
        byte[] code = new byte[32];
        sr.nextBytes(code);
        return Utils.getBase64String(code);
    }

    public static String generateCodeChallenge(@NonNull String codeVerifier) {
        byte[] input = getASCIIBytes(codeVerifier);
        byte[] signature = getSHA256(input);
        return getBase64String(signature);
    }

    private static String getBase64String(byte[] source) {
        return Base64.encodeToString(source, Base64.URL_SAFE | Base64.NO_WRAP | Base64.NO_PADDING);
    }

    static byte[] getASCIIBytes(String value) {
        byte[] input;
        try {
            input = value.getBytes(US_ASCII);
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Could not convert string to an ASCII byte array", e);
        }
        return input;
    }

    static byte[] getSHA256(byte[] input) {
        byte[] signature;
        try {
            MessageDigest md = MessageDigest.getInstance(SHA_256);
            md.update(input, 0, input.length);
            signature = md.digest();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Failed to get SHA-256 signature", e);
        }
        return signature;
    }

}
