// Fix for Yjs type errors
declare module 'lib0/encoding' {
  export class Encoder {
    constructor();
    toUint8Array(): Uint8Array;
  }
  
  export class Decoder {
    constructor(buf: Uint8Array);
  }
  
  export function encode(f: (arg0: Encoder) => void): Uint8Array;
}

// Fix for Intl.ResolvedRelativeTimeFormatOptions
declare namespace Intl {
  interface ResolvedRelativeTimeFormatOptions {
    style: 'long' | 'short' | 'narrow';
  }
}

// Fix for React JSX namespace
declare namespace React.JSX {
  interface Element {}
}
