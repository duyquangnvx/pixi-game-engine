/**
 * Type declarations for ase-parser package
 * Based on: https://github.com/mmuub/ase-parser
 */
declare module 'ase-parser' {
  export interface LayerFlags {
    visible: boolean;
    editable: boolean;
    lockMovement: boolean;
    preferLinkedCels: boolean;
    collapsedGroup: boolean;
    reference: boolean;
  }

  export interface Layer {
    flags: LayerFlags;
    type: number;
    layerChildLevel: number;
    opacity: number;
    tilesetIndex?: number;
    name: string;
  }

  export interface Cel {
    layerIndex: number;
    xpos: number;
    ypos: number;
    opacity: number;
    celType: number;
    zIndex: number;
    w: number;
    h: number;
    rawCelData: Buffer;
  }

  export interface Frame {
    bytesInFrame: number;
    frameDuration: number;
    cels: Cel[];
  }

  export interface Tag {
    from: number;
    to: number;
    animDirection: string;
    repeat: number;
    color: string;
    name: string;
  }

  export interface Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    name: string;
  }

  export interface Palette {
    paletteSize: number;
    firstColor: number;
    lastColor: number;
    colors: Color[];
    index?: number;
  }

  export interface ColorProfile {
    type: string;
    flag: number;
    fGamma: number;
    icc?: Buffer;
  }

  class Aseprite {
    frames: Frame[];
    layers: Layer[];
    fileSize: number;
    numFrames: number;
    width: number;
    height: number;
    colorDepth: number;
    paletteIndex: number;
    numColors: number;
    pixelRatio: string;
    name: string;
    tags: Tag[];
    colorProfile: ColorProfile;
    palette: Palette;

    constructor(buffer: Buffer, name: string);
    parse(): void;
  }

  export default Aseprite;
}
