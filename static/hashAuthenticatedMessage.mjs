//import hmac from "js-crypto-hmac";
const hashAlgo = "SHA-256";
export class hashAuthenticatedMessage {
    #key8;
    MAC;
    MAC8;
    Message;
    key;
    constructor(message, key) {
        //window.hmac = hmac;
        window.hashAlgo = hashAlgo;
        this.MessageWithTime = message;
        this.Message8 = new Uint8Array(message.length);
        this.key = key;
        let encoder = new TextEncoder();
        encoder.encodeInto(message, this.Message8);
        this.#key8 = new Uint8Array(key.length);
        encoder.encodeInto(key, this.#key8);
    }
    static async verifyHmacSHA256(message, key, expectedHex) {
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode(key),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const sig = await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            encoder.encode(message)
        );
        const computedHex = [...new Uint8Array(sig)]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        if (computedHex !== expectedHex) {
            console.error("HMAC verification failed", {
                message,
                key,
                expectedHex,
                computedHex,
            });
            return false;
        }
        return true;
    }
    async hmacSHA256(message, key) {
        const enc = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            enc.encode(key),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const sig = await crypto.subtle.sign(
            "HMAC",
            cryptoKey,
            enc.encode(message)
        );
        return [...new Uint8Array(sig)]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    async compute() {
        this.MAC8 = await this.hmacSHA256(this.MessageWithTime, this.key);
        this.MAC = "";
        for (let i = 0; i < this.MAC8.length; i++) {
            this.MAC += this.MAC8[i].toString(16).padStart(2, 0);
        }
        console.log("MAC8 follows for: ${} ${}");
        console.log(this.MAC8);
        this.MAC = this.MAC8;
        return this.MAC8;
        delete this.MAC8;
        delete this.Message8;
        return this.MAC8;
    }
    static async verifyAndReturn(message, key, hash) {
        console.log(`called to verify: ${message}, ${hash}`);
        let encoder = new TextEncoder();
        let key8 = new Uint8Array(key.length);
        let message8 = new Uint8Array(message.length);
        let hashA = hash.split("");
        let hash8tmp = [];
        let b = "";
        console.log(hashA);
        while (hashA.length !== 0) {
            let b = hashA.splice(0, 2);
            hash8tmp.push(parseInt(b.join(""), 16));
        }
        message8 = new Uint8Array(message.length);
        encoder.encodeInto(message, message8);
        message8 = encoder.encode(message);
        let hash8 = new Uint8Array(hash8tmp);
        encoder.encodeInto(key, key8);
        key8 = encoder.encode(key);
        //let result = await hmac.verify(key8, message8, hash8, hashAlgo);
        let result = await this.verifyHmacSHA256(message, key, hash);
        let debugResult = "";//await compute(key8, message8, hashAlgo);
        var debugResultFormatted = "";
        for (let i = 0; i < debugResult.length; i++) {
            debugResultFormatted += debugResult[i].toString(16).padStart(2, 0);
        }
        if (result === false)
            throw new Error(
                `MAC Error, expected: ${hash}, got ${debugResultFormatted}`
            );
        else return message;
    }
}
