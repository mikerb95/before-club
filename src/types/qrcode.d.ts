declare module 'qrcode' {
  interface ToBufferOptions {
    type?: string;
    rendererOpts?: any;
    errorCorrectionLevel?: 'L'|'M'|'Q'|'H';
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  }
  function toDataURL(text: string, opts?: ToBufferOptions): Promise<string>;
  function toBuffer(text: string, opts?: ToBufferOptions): Promise<Buffer>;
  export default { toDataURL, toBuffer };
}
