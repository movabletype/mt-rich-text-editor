import { BaseHTMLBlot } from "./base-html";

export class GenericInlineBlot extends BaseHTMLBlot {
  static blotName = "generic-inline";
  static tagName = ["object", "embed", "param"];
} 
