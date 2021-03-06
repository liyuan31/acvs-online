// Taken from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
// in 2018.

///////////////////////////////////////////////////////////////////////////////
///
/// A utility class for hash functions.
///
util.Hash = class Hash {
  ///////////////////////////////////////////////////////////////////////////////
  ///
  /// Convert an arraybuffer into a hex number
  ///
  static _hex (buffer) {
    var hexCodes = [];
    var view = new DataView(buffer);
    for (var i = 0; i < view.byteLength; i += 4) {
      // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
      var value = view.getUint32(i)
      // toString(16) will give the hex representation of the number without padding
      var stringValue = value.toString(16)
      // We use concatenation and slice for padding
      var padding = '00000000'
      var paddedValue = (padding + stringValue).slice(-padding.length)
      hexCodes.push(paddedValue);
    }

    // Join all the hex strings into one
    return hexCodes.join("");
  }

  ///////////////////////////////////////////////////////////////////////////////
  ///
  /// Apply the sha256 hash function on a string input
  ///
  static sha256 (str) {
    // We transform the string into an arraybuffer.
    let buffer = new TextEncoder("utf-8").encode(str);
    let result = {};
    crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
      result.hash = Hash._hex(hash); // unload from the Promise object
    });
    return result;
  }
}
